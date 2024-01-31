import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../context/AuthContext"
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import "./Login.scss";
import { ThemeContext } from "../../App";
import Navbar from "../../components/Navbar/Navbar";

const Login = () => {
    const [error, setError] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { theme } = useContext(ThemeContext);

    const navigate = useNavigate()

    const {dispatch} = useContext(AuthContext)

    const navigateToSignup = () => {
        navigate('/signup');
    }

    const handleLogin = (e) => {
        e.preventDefault();

        const userQuery = query(
            collection(db, "users"),
            where("email", "==", email)
        );

        getDocs(userQuery)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                return signInWithEmailAndPassword(auth, email, password);
            } else {
                throw new Error("Username or password is incorrect");
            }
        })
        .then((userCredential) => {
            dispatch({ type: "LOGIN", payload: userCredential.user });
            navigate("/");
        })
        .catch((error) => {
            console.error("Firebase Error:", error); // Log the actual error for debugging

            let userFriendlyError;
            switch (error.code) {
                case "auth/invalid-email":
                    userFriendlyError = "The email address is invalid.";
                    break;
                case "auth/user-not-found":
                    userFriendlyError = "Username or password is incorrect.";
                    break;
                case "auth/wrong-password":
                    userFriendlyError = "Username or password is incorrect.";
                    break;
                case "auth/too-many-requests":
                    userFriendlyError = "Too many unsuccessful login attempts. Please try again later.";
                    break;
                default:
                    userFriendlyError = "An unexpected error occurred. Please try again.";
                    break;
            }

            setError(new Error(userFriendlyError));
        });
    }

  return (

        <div className="login">
            <Navbar />
            <div className="login main">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                {error && <span>{error.message}</span>}
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
                <button type="submit">Login</button>
                <p>
                    Don't have an account? <span className="link" onClick={navigateToSignup}>Sign Up</span>
                </p>
                </form>
            </div>
        </div>

  );
};


export default Login;