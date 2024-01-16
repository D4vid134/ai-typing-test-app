import React from "react";
import { Link } from "react-router-dom";
import "./Results.scss";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Results = ({ timeElapsed, correctCharacters, typos, notCorrectedTypos, typedCount }) => {
    useEffect(() => {
        // console.log(currentUser);
    }, [timeElapsed]);

    const calculateWpm = () => {
        // docks 5 characters for every typo 
        let wpm = Math.floor((correctCharacters - (notCorrectedTypos * 5)) / 5 / (timeElapsed / 60));
        
        // special cases that are unrealistic
        if (notCorrectedTypos * 0.5 > correctCharacters) {
            wpm = Math.floor((correctCharacters - (notCorrectedTypos * 0.05)) / 5 / (timeElapsed / 60));
        }
        else if (notCorrectedTypos * 1 > correctCharacters) {
            wpm = Math.floor((correctCharacters - (notCorrectedTypos * 0.1)) / 5 / (timeElapsed / 60));
        }
        else if (notCorrectedTypos * 2 > correctCharacters) {
            wpm = Math.floor((correctCharacters - (notCorrectedTypos * 0.5)) / 5 / (timeElapsed / 60));
        } else if (notCorrectedTypos * 5 > correctCharacters) {
            wpm = Math.floor((correctCharacters - (notCorrectedTypos * 2)) / 5 / (timeElapsed / 60));
        }

        if (wpm < 0) {
            wpm = 0;
        }
        return wpm;
    }

    const calculateCorrectedAccuracy = () => {
        //based on notCorrectedTypos
        const accuracy = Math.floor(correctCharacters / (correctCharacters + notCorrectedTypos) * 100);
        return accuracy;
    }

    const calculateAccuracy = () => {
        //based on typos and typed
        const accuracy = Math.floor((typedCount - typos) / typedCount * 100);
        return accuracy;
    }

    return (
        //if results is empty object, show nothing
        <div className="results">
        {timeElapsed && (
            <div className="results-content">
                <div className="results-content-item first">
                    <div className="name">Characters</div>
                    <div className="value">{correctCharacters + notCorrectedTypos}</div>
                </div>
                <div className="results-content-item">
                    <div className="name">WPM</div>
                    <div className="value">{calculateWpm()}</div>
                </div>
                <div className="results-content-item">
                    <div className="name">Accuracy</div>
                    <div className="value">{calculateAccuracy()}%</div>
                </div>
                <div className="results-content-item last">
                    <div className="name">Corrected Acc.</div>
                    <div className="value">{calculateCorrectedAccuracy()}%</div>
                </div>

            </div>
        )}
    </div>
    );
}

export default Results;

    