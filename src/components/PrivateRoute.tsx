import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ element }) {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo ? element : <Navigate to="/login" replace />;
}

export default PrivateRoute;
