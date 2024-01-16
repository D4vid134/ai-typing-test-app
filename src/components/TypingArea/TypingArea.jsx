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

const TypingText = ({ text, userInput, isFocused }) => {
    // Define the block size
    const blockSize = 600; // Adjust based on your layout
    // Function to find the nearest space
    const findNearestSpace = (text, startIndex, endIndex) => {
        for (let i = endIndex; i > startIndex; i--) {
            if (text[i] === ' ') return i;
        }
        return endIndex; // Fallback if no space is found
    };

    // Split text into blocks but make sure to split on spaces
    const blocks = useMemo(() => {
        let startIndex = 0;
        const blocks = [];

        while (startIndex < text.length) {
            let tentativeEndIndex = startIndex + blockSize;
            if (tentativeEndIndex < text.length) {
                tentativeEndIndex = findNearestSpace(text, startIndex, tentativeEndIndex);
            } else {
                tentativeEndIndex = text.length;
            }

            blocks.push(text.slice(startIndex, tentativeEndIndex));
            startIndex = tentativeEndIndex + 1; // Move past the space
        }

        return blocks;
    }, [text, blockSize]);

    const renderBlock = useCallback((index, block) => {
        return (
            <div className="text-block" key={index}>
                {block.split('').map((char, charIndex) => {
                    const absoluteIndex = index * blockSize + charIndex;
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
    }, [userInput, isFocused, blockSize]);

    return (
        <Virtuoso
            data={blocks}
            itemContent={(index, block) => renderBlock(index, block)}
            style={{ overflow: 'hidden', scrollBehavior: 'smooth' }}
            overscan={70}
            id='text'
        />
    );
};

TypingText.displayName = 'TypingText';

const TypingArea = ({ text, seconds, showResults }) => {
    const hiddenInputRef = useRef(null);
    const typingAreaRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [typoCount, setTypoCount] = useState(0);
    const [typedCount, setTypedCount] = useState(0);
    const [lastInputIsTypo, setLastInputIsTypo] = useState(false);
    const noTimer = seconds === -1;
    // const [count, setCount] = useState(0);

    useEffect(() => {
        if (isRunning) {
            setStartTime(Date.now());
        } else {
            setStartTime(null);
        }
    }, [isRunning]);

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

    // Focus the hidden input whenever the component mounts
    useEffect(() => {
        // hiddenInputRef.current.focus();
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

    const countCorrectAndIncorrect = (userText, text) => {
        let correctCount = 0;
        let incorrectCount = 0;
        console.log(userText);
        console.log(text);
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

    const scroll = (scrollValue) => {
        const scrollDiv = document.getElementById('text');
        if (scrollDiv) {
            // Scrolls the div by the specified number of pixels
            scrollDiv.scrollTop += scrollValue;
        }
    };
    
    const handleUserInput = (e) => {
        // check if backspace was pressed
        let backspacePressed = false;
        if (e.nativeEvent.inputType === 'deleteContentBackward') {
            backspacePressed = true;
        } else {
            setTypedCount(prevTypedCount => prevTypedCount + 1);
        }

        if (!isRunning) {
            setIsRunning(true);
        }

        // const currentCharRect = typingAreaRef.current.children[0].children[userInput.length].getBoundingClientRect();
        const input = e.target.value;
        setUserInput(input);

        if (input.length >= userInput.length) {
            if (input[input.length - 1] !== text[input.length - 1]) {
                setTypoCount(typoCount + 1);
            }
        }

        // Check if the user has finished typing all the text
        if (input.length === text.length && input) {
            hiddenInputRef.current.blur();
            const { correctCount, incorrectCount } = countCorrectAndIncorrect(input, text);
            showResults(timeElapsed, correctCount, incorrectCount, typoCount, typedCount);
        }

        const amountOfBlocks = typingAreaRef.current.children[0].children[0].lastElementChild.children.length;
        for (let i = 0; i < amountOfBlocks; i++) {
            const currentBlock = typingAreaRef.current.children[0].children[0].lastElementChild.children[i].lastElementChild;
            const currentCharElement = currentBlock.querySelector('.current');

            if (currentCharElement) {
                let currentCharRect = currentCharElement.getBoundingClientRect();
                
                if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    // Check if current character is not the first child
                    if (currentCharElement !== currentBlock.firstElementChild) {
                        let previousCharRect = currentCharElement.previousElementSibling.getBoundingClientRect();
                        
                        // Check if the previous character is on a different line
                        if (previousCharRect.bottom + 2 < currentCharRect.bottom) {
                            scroll(-52); // Scroll up
                        }
                    }
                } else {
                    // Check if current character is not the last child
                    if (currentCharElement !== currentBlock.lastElementChild) {
                        let nextCharRect = currentCharElement.nextElementSibling.getBoundingClientRect();
                
                        // Check if the next character is on a different line
                        if (nextCharRect.bottom > currentCharRect.bottom) {
                            scroll(52); // Scroll down
                        }
                    }
                }
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
                <TypingText text={text} userInput={userInput} isFocused={isFocused} id="text" />
                    <input
                        type="text"
                        ref={hiddenInputRef}
                        value={userInput}
                        onChange={handleUserInput}
                        className='hidden-input'
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        </div>

    );
}

export default TypingArea;