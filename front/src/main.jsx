import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "./pages/login";
import Questions from "./pages/questions";
import PrivateRoute from "./lib/PrivateRoute";
import PublicRoute from "./lib/PublicRoute";
import Signup from "./pages/signup";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/add/path/test" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/questions"
                    element={
                        <PrivateRoute>
                            <PublicRoute>
                                <Questions />
                            </PublicRoute>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
