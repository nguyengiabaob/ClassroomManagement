import React, { useEffect } from "react";

import "./index.css";

import "./App.css";
import { RoutesApp } from "./routes";

function App() {
  const checkUserLogin = () => {
    const userSession = localStorage.getItem("user_session");
    console.log("sdsadas", userSession);

    // if (!userSession && window.location.pathname !== "/login") {
    //   window.location.href = "/login";
    // }
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
