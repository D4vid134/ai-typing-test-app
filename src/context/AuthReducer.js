const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": {
      return {
        currentUser: action.payload,
      };
    }
    case "LOGOUT": {
      return {
        currentUser: null,
        userData: null,
      };
    }
    case "SET_USER_DATA": {
      return {
        ...state,
        userData: action.payload,
      };
    }
    default:
      return state;
  }
};

export default AuthReducer;
