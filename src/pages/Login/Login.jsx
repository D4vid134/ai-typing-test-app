import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
// import {AuthContext} from "../../context/AuthContext"
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../../firebase";


const Login = () => {
//   const [error, setError] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate()

//   const {dispatch} = useContext(AuthContext)

//   const handleLogin = (e) => {
//     e.preventDefault();

//     const userQuery = query(
//       collection(db, "users"),
//       where("email", "==", email)
//     );

//     getDocs(userQuery)
//       .then((querySnapshot) => {
//         if (!querySnapshot.empty) {
//           const userDoc = querySnapshot.docs[0];
//           const userData = userDoc.data();

//           if (userData.admin || userData.superAdmin) {
//             return signInWithEmailAndPassword(auth, email, password);
//           } else {
//             throw new Error(
//               "You don't have the required permissions to access this system. Contact support for more details."
//             );
//           }
//         } else {
//           throw new Error("Username or password is incorrect");
//         }
//       })
//       .then((userCredential) => {
//         dispatch({ type: "LOGIN", payload: userCredential.user });
//         navigate("/");
//       })
//       .catch((error) => {
//         // Check if the error is due to incorrect password
//         if (error.code === "auth/wrong-password") {
//           setError(new Error("Username or password is incorrect"));
//         } else {
//           setError(error);
//         }
//       });
//   };

  return (
    <></>
//     <div className="login">
//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="email"
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="password"
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">Login</button>
//         {error && <span>{error.message}</span>}
//       </form>
//     </div>
  );
};

export default Login;