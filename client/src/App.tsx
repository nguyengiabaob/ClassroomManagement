import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

import "./index.css";

import "./App.css";
import { checkToken, getCurrentUser } from "./features/login/loginService";
import { saveUserlogined } from "./redux/usersReducer";
import type { AppDispatch } from "./redux/store";
import { RoutesApp } from "./routes";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const loginCheckStarted = useRef(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (loginCheckStarted.current) return;
    loginCheckStarted.current = true;

    const checkUserLogin = async () => {
      const userSession = localStorage.getItem("user_session");

      if (!userSession && window.location.pathname !== "/login") {
        window.location.href = "/login";
        return;
      }

      if (userSession) {
        try {
          const { accessToken, refreshToken } = await checkToken();
          console.log(accessToken, refreshToken);

          if (
            typeof accessToken !== "string" ||
            !accessToken.trim() ||
            typeof refreshToken !== "string" ||
            !refreshToken.trim()
          ) {
            throw new Error("Token verification failed");
          }

          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);

          const { data: currentUser } = await getCurrentUser();
          dispatch(
            saveUserlogined({
              ...currentUser,
              authentication: true,
              accessToken,
              refreshToken,
            }),
          );
          if (window.location.pathname === "/login") {
            window.location.href = "/";
            return;
          }
        } catch {
          // localStorage.removeItem("user_session");
          // localStorage.removeItem("access_token");
          // localStorage.removeItem("refresh_token");
          dispatch(saveUserlogined(null));

          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
            return;
          }
        }
      }

      setIsCheckingSession(false);
    };

    void checkUserLogin();
  }, [dispatch]);

  if (isCheckingSession) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spin size="large" />
        {/* <p>Checking your session...</p> */}
      </div>
    );
  }

  return (
    <React.Fragment>
      <RoutesApp />
    </React.Fragment>
  );
}

export default App;
