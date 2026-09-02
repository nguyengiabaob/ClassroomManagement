import React, { useEffect } from "react";

import "./index.css";

import "./App.css";
import { getCurrentUser } from "./features/login/loginService";
import { saveUserlogined } from "./redux/usersReducer";
import type { AppDispatch } from "./redux/store";
import { RoutesApp } from "./routes";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkUserLogin = async () => {
      const userSession = localStorage.getItem("user_session");

      if (!userSession && window.location.pathname !== "/login") {
        window.location.href = "/login";
        return;
      }

      if (userSession) {
        const { data: currentUser } = await getCurrentUser();
        dispatch(saveUserlogined(currentUser));
      }
    };

    void checkUserLogin();
  }, [dispatch]);

  return (
    <React.Fragment>
      <RoutesApp />
    </React.Fragment>
  );
}

export default App;
