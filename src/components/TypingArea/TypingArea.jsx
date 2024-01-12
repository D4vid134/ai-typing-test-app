import './TypingArea.scss'
import { useRef, useState } from 'react';
import { useEffect, memo, useCallback } from 'react';

const Character = memo(({ char, status }) => {
    return <span className={status}>{char}</span>;
});

Character.displayName = 'Character';

const TypingArea = ({ text }) => {
    const hiddenInputRef = useRef(null);
    const typingAreaRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };
    
    const handleBlur = () => {
        setIsFocused(false);
    };

    //need to move the typing area up so that the current char rect is at a certain spot of the outer container

    // useEffect(() => {
    //     const handleResize = () => {
    //         // Calculate the new scroll position based on the current user input
    //         const currentCharRect = typingAreaRef.current.children[0].children[userInput.length].getBoundingClientRect();
    //         const typingAreaRect = typingAreaRef.current.getBoundingClientRect();
    
    //         // If the current character is not visible, adjust the scroll position
    //         if (currentCharRect.bottom > typingAreaRect.bottom || currentCharRect.top < typingAreaRect.top) {
    //             const newBottom = currentCharRect.bottom - typingAreaRect.bottom;
    //             typingAreaRef.current.style.bottom = `${newBottom}px`;
    //         }
    //     };
    
    //     window.addEventListener('resize', handleResize);
    
    //     // Clean up the event listener when the component unmounts
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }, []);

    // Focus the hidden input whenever the component mounts
    useEffect(() => {
        hiddenInputRef.current.focus();
        reset();
    }, [text]);

    const reset = () => {
        setUserInput('');
        hiddenInputRef.current.value = '';
    };

    const handleUserInput = (e) => {
        const currentCharRect = typingAreaRef.current.children[0].children[userInput.length].getBoundingClientRect();

        const input = e.target.value;
        setUserInput(input);

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

        // Check if the user has finished typing all the text
        if (input.length === text.length && input) {
            let correctCount = 0;
            let incorrectCount = 0;

            // Count correct and incorrect characters
            for (let i = 0; i < text.length; i++) {
                if (input[i] === text[i]) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            }

            console.log(`Congratulations! You've finished typing.`);
            console.log(`Characters typed correctly: ${correctCount}`);
            console.log(`Characters typed incorrectly: ${incorrectCount}`);
        }
    };

    const renderCharacter = useCallback((char, index) => {
        let status = '';
        const userInputChar = userInput[index];

        if (index < userInput.length) {
            status = userInputChar === char ? 'correct' : 'incorrect';
        } else if (isFocused && index === userInput.length) {
            status += ' current';
        }

        return <Character key={index} char={char} status={status} />;
    }, [userInput, isFocused]);

    const renderText = useCallback(() => {
        return text.split('').map(renderCharacter);
    }, [text, renderCharacter]);

    return (
        <div className='outer-container'>
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

    );
}

export default TypingArea;