import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "./pages/login";
import Questions from "./pages/questions";
import Question from "./pages/question";
import PrivateRoute from "./lib/PrivateRoute";
import PublicRoute from "./lib/PublicRoute";
import Header from "./lib/Header";
import Signup from "./pages/signup";
import User from "./pages/user";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/add/path/test" element={<App />} />
                <Route path="/user" element={<User />} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/questions"
                    element={
                        <PrivateRoute>
                            <Header>
                                <Questions />
                            </Header>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/questions/:questionID"
                    element={
                        <PrivateRoute>
                            <Header>
                                <Question />
                            </Header>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
