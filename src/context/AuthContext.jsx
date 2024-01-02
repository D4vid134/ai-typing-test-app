import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  userData: null,
};

export const AuthContext = createContext(INITIAL_STATE);



export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    let unsubscribeSnapshot = null;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User logged in
        dispatch({ type: "LOGIN", payload: user });
        localStorage.setItem("user", JSON.stringify(user));
        
        unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
              dispatch({ type: "SET_USER_DATA", payload: doc.data() });
              console.log("User data:", doc.data());
            } else {
              console.error("User document does not exist");
            }
          },
          (error) => {
            console.error("Error listening to user data changes:", error);
          }
        );
      } else {
        // User logged out
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };

  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, userData: state.userData, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
