import React, { useEffect } from "react";
import "./App.css";
import { RoutesApp } from "./routes";
import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();
  const checkUserLogin = () => {
    localStorage.getItem("user_session");
    if (!checkUserLogin) {
      window.location.href = "/login";
    } else {
      navigate(window.location.href);
    }
  };
  useEffect(() => {
    checkUserLogin();
  }, []);

  return (
    <React.Fragment>
      <RoutesApp />
    </React.Fragment>
  );
}

export default App;
