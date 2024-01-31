import './TypingArea.scss'
import { useRef, useState } from 'react';
import { useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { useMemo } from 'react';

const Character = memo(({ char, status }) => {
    return <span className={status}>{char}</span>;
});

Character.displayName = 'Character';

const TypingText = ({ passages, userInput, isFocused }) => {
        // separate the text into blocks so that the virtualized list can render it efficiently
        const blocks = useMemo(() => {
            let cumulativeLength = 0;
            const resultBlocks = [];
    
            for (let i = 0; i < passages.length; i++) {
                resultBlocks.push({ text: passages[i], startIndex: cumulativeLength });
                cumulativeLength += passages[i].length;
            }
    
            return resultBlocks;
        }, [passages]);
    
        const renderBlock = useCallback((index, block) => {
            return (
                <div className="text-block" key={index}>
                    {block.text.split('').map((char, charIndex) => {
                        const absoluteIndex = block.startIndex + charIndex;
                        let status = '';
                        const userInputChar = userInput[absoluteIndex];
                        if (absoluteIndex < userInput.length) {
                            status = userInputChar === char ? 'correct' : 'incorrect';
                        } else if (isFocused && absoluteIndex === userInput.length) {
                            status = 'current';
                        }
    
                        return <Character key={charIndex} char={char} status={status} />;
                    })}
                </div>
            );
        }, [userInput, isFocused]);

    return (
        <Virtuoso
            data={blocks}
            itemContent={(index, block) => renderBlock(index, block)}
            style={{ overflow: 'hidden', scrollBehavior: 'smooth' }}
            overscan={100}
            id='text'
        />
    );
};

TypingText.displayName = 'TypingText';

const TypingArea = ({ passages, seconds, showResults, text }) => {
    const hiddenInputRef = useRef(null);
    const typingAreaRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [typoCount, setTypoCount] = useState(0);
    const [typedCount, setTypedCount] = useState(0);
    const keysPressed = useRef({});
    const [lastInputIsTypo, setLastInputIsTypo] = useState(false);
    const [scrollQueue, setScrollQueue] = useState([]);
    const [isScrolling, setIsScrolling] = useState(false);
    const noTimer = seconds === -1;

    useEffect(() => {
        if (isRunning) {
            setStartTime(Date.now());
        } else {
            setStartTime(null);
        }
    }, [isRunning]);

    useEffect(() => {
        reset();
    }, [text]);

    const reset = () => {
        setIsRunning(false);
        setUserInput('');
        setTimeElapsed(0);
        setStartTime(null);
        setTypoCount(0);
        setLastInputIsTypo(false);
        hiddenInputRef.current.value = '';
    };

    useEffect(() => {
        function downHandler(event) {
            const { key } = event;
            if (key === 'Enter' || key === 'Tab' ) {
                event.preventDefault();
            }
            keysPressed.current[key] = true;
            if (keysPressed.current['Enter'] && keysPressed.current['Tab']) {
                event.preventDefault();
                // show results causes a reset. Sending 0s will make sure the results arent saved
                showResults(0, 0, 0, 0, 0);
            }
        }

        function upHandler({ key }) {
            keysPressed.current[key] = false;
            if (key === ' ') {
                hiddenInputRef.current.focus();
            }


        }

        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, []);
    
    useEffect(() => {
        let intervalId;
        if (isRunning && (seconds - timeElapsed > 0 || noTimer)) {
            intervalId = setInterval(() => {
                const now = Date.now();
                const timeElapsed = Math.floor((now - startTime) / 1000);
                setTimeElapsed(timeElapsed);
                // onData(timeElapsed);
            }, 333);
        } else if (isRunning && seconds - timeElapsed <= 0) {
            setIsRunning(false);
            hiddenInputRef.current.blur();
            // get text until the last character the user typed
            const userText = text.slice(0, userInput.length);
            const { correctCount, incorrectCount } = countCorrectAndIncorrect(userInput, userText);
            showResults(timeElapsed, correctCount, incorrectCount, typoCount, typedCount);

        }

        // Clean up function
        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, timeElapsed, seconds, noTimer, showResults, startTime]);

    const getTimeRemaining = () => {
        const minutes = Math.floor((seconds - timeElapsed) / 60);
        const secondsRemaining = (seconds - timeElapsed) % 60;
        return `${minutes}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;
    };
        

    const handleFocus = () => {
        setIsFocused(true);
        typingAreaRef.current.style.filter = 'blur(0px)';
        
    };
    
    const handleBlur = () => {
        setIsFocused(false);
        typingAreaRef.current.style.filter = 'blur(10px)';
    };

    const countCorrectAndIncorrect = (userText, text) => {
        let correctCount = 0;
        let incorrectCount = 0;
        // Count correct and incorrect characters
        for (let i = 0; i < text.length; i++) {
            if (userText[i] === text[i]) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        }

        return { correctCount, incorrectCount };
    };

    const queueScroll = (scrollValue) => {
        setScrollQueue(prevQueue => [...prevQueue, scrollValue]);
    };

    // delay the scroll to prevent it from scrolling too fast and overwriting the previous scroll
    useEffect(() => {
        if (scrollQueue.length > 0 && !isScrolling) {
            setIsScrolling(true);
            const scrollDiv = document.getElementById('text');
            if (scrollDiv) {
                const scrollValue = scrollQueue[0];
                console.log(scrollDiv.scrollTop);

                scrollDiv.scrollBy({
                    top: scrollValue,
                    left: 0,
                    behavior: 'smooth'
                });

                // Estimate scroll duration (e.g., 250ms per 100px scroll)
                const estimatedDuration = Math.abs(scrollValue / 100) * 250;

                setTimeout(() => {
                    setIsScrolling(false);
                    setScrollQueue(prevQueue => prevQueue.slice(1));
                }, estimatedDuration);
            }
        }
    }, [scrollQueue, isScrolling]);

    const handleScrolling = (currentBlock, currentCharElement, inputType, currentBlockIndex) => {
        const scrollAmount = 48;
        let currentCharRect = currentCharElement.getBoundingClientRect();
        
            if (inputType === 'deleteContentBackward') {
                if (currentCharElement !== currentBlock.firstElementChild) {
                    let previousCharRect = currentCharElement.previousElementSibling.getBoundingClientRect();
                    
                    if (previousCharRect.bottom + 2 < currentCharRect.bottom) {
                        queueScroll(-scrollAmount);
                    }
                } else {
                    const previousBlock = typingAreaRef.current.children[0].children[0].lastElementChild.children[currentBlockIndex - 1].lastElementChild;
                    const previousCharElement = previousBlock.lastElementChild;
                    let previousCharRect = previousCharElement.getBoundingClientRect();
                    if (previousCharRect.bottom + 2 < currentCharRect.bottom) {
                        queueScroll(-scrollAmount);
                    }
                }
            } else {
                if (currentCharElement !== currentBlock.lastElementChild) {
                    let nextCharRect = currentCharElement.nextElementSibling.getBoundingClientRect();
            
                    if (nextCharRect.bottom > currentCharRect.bottom) {
                        queueScroll(scrollAmount);
                    }
                } else {
                    console.log('next block');
                    const nextBlock = typingAreaRef.current.children[0].children[0].lastElementChild.children[currentBlockIndex + 1].lastElementChild;
                    const nextCharElement = nextBlock.firstElementChild;
                    let nextCharRect = nextCharElement.getBoundingClientRect();
                    if (nextCharRect.bottom > currentCharRect.bottom) {
                        queueScroll(scrollAmount);
                    }
                }
            }
    };
    
    const handleUserInput = (e) => {
        // check if backspace was pressed
        const inputType = e.nativeEvent.inputType;
        if (inputType === 'deleteContentBackward') {
            // backspacePressed = true;
        } else {
            setTypedCount(prevTypedCount => prevTypedCount + 1);
        }

        if (!isRunning) {
            setIsRunning(true);
        }
        let input = e.target.value;
        
        if (e.nativeEvent.key === 'Enter') {
            input = e.target.value + ' ';
        }
        setUserInput(input);

        if (input.length >= userInput.length) {
            if (input[input.length - 1] !== text[input.length - 1]) {
                setTypoCount(typoCount + 1);
            }
        }

        // // Check if the user has finished typing all the text
        // if (input.length === text.length && input) {
        //     hiddenInputRef.current.blur();
        //     const { correctCount, incorrectCount } = countCorrectAndIncorrect(input, text);
        //     showResults(timeElapsed, correctCount, incorrectCount, typoCount, typedCount);
        // }

        const amountOfBlocks = typingAreaRef.current.children[0].children[0].lastElementChild.children.length;
        for (let i = 0; i < amountOfBlocks; i++) {
            const currentBlock = typingAreaRef.current.children[0].children[0].lastElementChild.children[i].lastElementChild;
            const currentCharElement = currentBlock.querySelector('.current');

            if (currentCharElement) {
                handleScrolling(currentBlock, currentCharElement, inputType, i);
            }
        }
    };

    return (
        <div className='outer-container'>
            {!noTimer && (
                <div className='timer'>
                    {getTimeRemaining()}
                </div>
            )}

            <div className='inner-container'>
                {!isFocused && (
                    <div id='message-focus-container'>
                        <div id='focus'>
                            Click or Spacebar To Type
                        </div>
                    </div>
                )}
                <div id="typing-area" onClick={() => hiddenInputRef.current.focus()} ref={typingAreaRef}>
                <TypingText passages={passages} userInput={userInput} isFocused={isFocused} id="text" />
                    <input
                        type="text"
                        ref={hiddenInputRef}
                        value={userInput}
                        onChange={handleUserInput}
                        className='hidden-input'
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        // on enter button do handleUserInput but with a space
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUserInput(e);
                                e.preventDefault();
                                // e.stopPropagation();
                            }
                        }}
                    />
                </div>
            </div>
        </div>

    );
}

export default TypingArea;