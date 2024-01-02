//generate boilerplate for react signup page
// Path: ai-typing-test-app/src/pages/Signup/Signup.jsx
// Compare this snippet from ai-typing-test-app/src/pages/Login/Login.jsx:
import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
// import {AuthContext} from "../../context/AuthContext"
import { collection, getDocs, query, where } from "firebase/firestore";


const Signup = () => {
    return (
        <div className="signup">
            <h1>Signup</h1>
        </div>
    );
}

export default Signup;