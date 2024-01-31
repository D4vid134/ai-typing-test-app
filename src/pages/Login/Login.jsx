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
        // Check if the error is due to incorrect password
        if (error.code === "auth/wrong-password") {
          setError(new Error("Username or password is incorrect"));
        } else {
          setError(error);
        }
      });
  };

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
            Don't have an account? <span className="link" onClick={navigateToSignup}>Signup</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;