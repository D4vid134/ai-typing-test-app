import React, { useState, useContext } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import "./Signup.scss";
import Navbar from "../../components/Navbar/Navbar";

const Signup = () => {
    const [error, setError] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { dispatch } = useContext(AuthContext);

    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate('/login');
    };

    const handleSignup = (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
            setError({ message: "Passwords do not match." });
            return;
        }

        const minutes = [0.5, 1, 2, 3, 5];
        const types = ["All", "science", "history", "fun facts", "mythology", "sports"];

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Create a new user document
                const userRef = doc(db, "users", userCredential.user.uid);
                
                // Set user email in the user document
                setDoc(userRef, { email });

                minutes.forEach((minute) => {
                    let minuteData = {};
                    types.forEach((type) => {
                        const storageResultsForMinute = JSON.parse(localStorage.getItem("resultsFor" + minute)) || {};
                        console.log(storageResultsForMinute);
                        const storageResults = storageResultsForMinute[type] || [];
                        
                        minuteData[type] = storageResults;
                    });

                    const minuteDocRef = doc(db, "users", userCredential.user.uid, "results", minute.toString());
                    setDoc(minuteDocRef, minuteData)
                        .then(() => console.log("Document written for minute: ", minute))
                        .catch((error) => console.error("Error adding document: ", error));
                });

                dispatch({ type: "LOGIN", payload: userCredential.user });
                navigate("/");
            })
            .catch((error) => {
                setError(error);
            });
    };

    return (
    <div className="signup">
        <Navbar />
        <div className="signup main">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignup}>
                {error && <span className="error">{error.message}</span>}
                <input
                    type="email"
                    placeholder="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="confirm password"
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                />

                <button type="submit">Sign Up</button>
                <p>
                    Already have an account? <span className="link" onClick={navigateToLogin}>Login</span>
                </p>
            </form>
        </div>
    </div>
  );
};

export default Signup;