import './TypingArea.scss'
import { useRef, useState } from 'react';
import { useEffect, memo, useCallback } from 'react';

const Character = memo(({ char, status }) => {
    return <span className={status}>{char}</span>;
});

Character.displayName = 'Character';

const TypingArea = ({ text, seconds, showResults }) => {
    const hiddenInputRef = useRef(null);
    const typingAreaRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [typoCount, setTypoCount] = useState(0);
    const [lastInputIsTypo, setLastInputIsTypo] = useState(false);
    const noTimer = seconds === -1;

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
            }, 1000);
        } else if (isRunning && seconds - timeElapsed <= 0) {
            setIsRunning(false);
            hiddenInputRef.current.blur();
            // get text until the last character the user typed
            const userText = text.slice(0, userInput.length);
            const { correctCount, incorrectCount } = countCorrectAndIncorrect(userInput, userText);
            showResults(timeElapsed, correctCount, incorrectCount, typoCount);

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

    const handleUserInput = (e) => {
        if (!isRunning) {
            setIsRunning(true);
        }

        const currentCharRect = typingAreaRef.current.children[0].children[userInput.length].getBoundingClientRect();

        const input = e.target.value;
        setUserInput(input);

        // if not backspace, increment typo count if the current character is incorrect and the last input was not a typo
        if (input.length >= userInput.length) {
            if (input[input.length - 1] !== text[input.length - 1]) {
                setTypoCount(typoCount + 1);
            }
            //     setLastInputIsTypo(true);
            // } else if (input[input.length - 1] === text[input.length - 1] && lastInputIsTypo) {
            //     setLastInputIsTypo(false);
            // }
        }

        // Check if the user has finished typing all the text
        if (input.length === text.length && input) {
            hiddenInputRef.current.blur();
            console.log('finished');
            setTimeout(() => {
                const { correctCount, incorrectCount } = countCorrectAndIncorrect(input, text);
                showResults(timeElapsed, correctCount, incorrectCount, typoCount);
            }, 1000);
        }

        try {
            // Automatically scroll to the next line
            const nextCharRect = typingAreaRef.current.children[0].children[input.length].getBoundingClientRect();

            if (nextCharRect.bottom > currentCharRect.bottom) {
                // Move the typing area up by the height of the next line
                const currentBottom = typingAreaRef.current.style.bottom ? parseInt(typingAreaRef.current.style.bottom) : 0;

                // 66 is the height of a line. Use raw number to avoid problem when mid animation
                typingAreaRef.current.style.bottom = `${currentBottom + 66}px`;          
            }

            // if backspaced and the current character is on the previous line
            if (currentCharRect.bottom > nextCharRect.bottom + 2) {
                const currentBottom = typingAreaRef.current.style.bottom ? parseInt(typingAreaRef.current.style.bottom) : 0;
                typingAreaRef.current.style.bottom = `${currentBottom - 66}px`;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const renderCharacter = useCallback((char, index) => {
        let status = '';
        const userInputChar = userInput[index];

        if (index < userInput.length) {
            // need to increment a counter for incorrect chars
            if (userInputChar === char) {
                status = 'correct';
                // if (lastInputIsTypo) {
                //     setLastInputIsTypo(false);
                // }
            } else {
                status = 'incorrect';
                // if (!lastInputIsTypo) {
                    // setTypoCount(typoCount + 1);
                //     setLastInputIsTypo(true);
                // }
            }
            // status = userInputChar === char ? 'correct' : 'incorrect';

        } else if (isFocused && index === userInput.length) {
            status += ' current';
        }

        return <Character key={index} char={char} status={status} />;
    }, [userInput, isFocused]);

    const renderText = useCallback(() => {
        let tempText;
        if (userInput.length > text.length - 300) {
            tempText = text;
        }

        if (userInput.length < 2400) {
            tempText = text.slice(0, 2500);
        } else if (userInput.length < 4000) {
            tempText = text.slice(0, 4100);
        } else if (userInput.length < 6000) {
            tempText = text.slice(0, 6100);
        }
        return text.split('').map(renderCharacter);
    }, [text, renderCharacter]);

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
                            Click To Type
                        </div>
                    </div>
                )}

                <div id="typing-area" onClick={() => hiddenInputRef.current.focus()} ref={typingAreaRef}>
                    <div className="text">
                        {renderText()}
                    </div>
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