import { useSelector } from "react-redux";

const useIsAuthenticated = () => {
  // Get token from Redux store
  const reduxToken = useSelector((state) => state.auth.token);
  // Get token from localStorage
  const localStorageToken = localStorage.getItem("token");
  const token = localStorageToken || reduxToken;

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    console.error("Token validation error:", e);
    return false;
  }
};

export default useIsAuthenticated;
