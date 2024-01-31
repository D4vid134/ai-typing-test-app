import React from "react";
import { Link } from "react-router-dom";
import "./Results.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Results = ({ timeElapsed, correctCharacters, typos, notCorrectedTypos, typedCount, type, trigger}) => {
    const [results, setResults] = useState([]);

    const { currentUser } = useContext(AuthContext);

    const updateFirestoreResults = (result, minutes, type) => {
        const userResultsRef = doc(db, "users", currentUser.uid, "results", minutes);
        getDoc(userResultsRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const storageResults = docSnapshot.data()[type] || [];
                    storageResults.push(result);
                    updateDoc(userResultsRef, { [type]: storageResults });
                } else {
                    setDoc(userResultsRef, { [type]: [result] });
                }
            })
            .catch((error) => {
                console.error("Error updating Firestore: ", error);
            });
    };
    
    const updateLocalStorageResults = (result, minutes, type) => {
        const storageResultsForMinute = JSON.parse(localStorage.getItem("resultsFor" + minutes)) || {};
        const storageResults = storageResultsForMinute[type] || [];
    
        if (storageResults.length >= 50) {
            storageResults.shift();
        }
    
        storageResults.push(result);
        storageResultsForMinute[type] = storageResults;
        localStorage.setItem("resultsFor" + minutes, JSON.stringify(storageResultsForMinute));
        setResults(storageResults);
    };
    
    useEffect(() => {
        if (timeElapsed > 0) {
            const minutes = (timeElapsed / 60).toString();
            const result = {
                wpm: calculateWpm(),
                accuracy: calculateAccuracy(),
                correctedAccuracy: calculateCorrectedAccuracy(),
                date: new Date().toISOString(),
            };
    
            if (currentUser) { 
                updateFirestoreResults(result, minutes, type);
                updateLocalStorageResults(result, minutes, type);
            } else {
                updateLocalStorageResults(result, minutes, type);
            }
        }
    }, [timeElapsed, trigger, currentUser]);

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

    const averageOfPast5 = () => {
        let sum = 0;
        let count = 0;
        for (let i = results.length - 1; i >= 0 && count < 5; i--) {
            sum += results[i].wpm;
            count++;
        }
        return Math.floor(sum / count);
    }

    return (
        <>
            <div className="results">
                {timeElapsed && (
                    <div className="results-content">
                        <div className="results-content-item first">
                            <div className="name">WPM</div>
                            <div className="value">{calculateWpm()}</div>
                        </div>
                        <div className="results-content-item">
                            <div className="name">Accuracy</div>
                            <div className="value">{calculateAccuracy()}%</div>
                        </div>
                        <div className="results-content-item">
                            <div className="name">Corrected Acc.</div>
                            <div className="value">{calculateCorrectedAccuracy()}%</div>
                        </div>
                        <div className="results-content-item last">
                            <div className="name">Past 5 Avg WPM</div>
                            <div className="value">{averageOfPast5()}</div>
                        </div>

                    </div>
                )}

            {!currentUser && timeElapsed && (
                <div id='login-prompt'>
                    Log in to ensure all your results are saved
                </div>
            )}
            </div>

        </>
    );
}

export default Results;

    