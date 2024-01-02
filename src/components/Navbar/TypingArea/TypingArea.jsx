import './TypingArea.scss'
import { useRef, useState } from 'react';
import { useEffect } from 'react';

const TypingArea = ({ text, handleUserInput }) => {
    const wordCountRef = useRef();
    const focusCharsRef = useRef();
    const hiddenInputRef = useRef(null);
    const [userInput, setUserInput] = useState('');

    // Focus the hidden input whenever the component mounts
    useEffect(() => {
        hiddenInputRef.current.focus();
    }, []);

    const handleUserInput = (e) => {
        const input = e.target.value;
        setUserInput(input);

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

    const renderText = () => {
        return text.split('').map((char, index) => {
            let charClasses = [];
            const userInputChar = userInput[index];

            // Determine the character class based on user input
            if (index < userInput.length) {
                charClasses.push(userInputChar === char ? 'correct' : 'incorrect');
            }

            // Highlight the current character
            if (index === userInput.length) {
                charClasses.push('current');
            }

            

            return (
                <span key={index} className={charClasses.join(' ')}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div id="typing-area" onClick={() => hiddenInputRef.current.focus()}>
            <div className="text">
                {renderText()}
            </div>
            <input
                type="text"
                ref={hiddenInputRef}
                value={userInput}
                onChange={handleUserInput}
            />
        </div>
    );
}
