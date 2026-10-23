import { useContext } from "react";
import AuthContext from "./AuthContext.js";

const useAuth = () => useContext(AuthContext);

export default useAuth;
