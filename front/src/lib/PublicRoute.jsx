import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Route } from "react-router-dom";
import "./PublicRoute.css";

function PublicRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(false);
    const [Logout, setLogout] = useState(false);
    const [UserInfo, setUserInfo] = useState();

    useEffect(() => {
        axios
            .get("/api/whoami")
            .then((e) => {
                if (e.status === 200) {
                    setIsLogin(true);
                    setUserInfo(e.data);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const onClickHandler = function () {
        axios.get("/api/logout").then((e) => {
            setLogout(true);
        });
    };

    if (Logout) {
        return <Navigate replace to="/login" />;
    }

    if (!loading) {
        if (isLogin) {
            const elements = [
                <header>
                    <div>こんにちは {UserInfo.username} さん！</div>
                    <button type="button" onClick={onClickHandler}>
                        ログアウトする
                    </button>
                </header>,
                children,
            ];
            return elements;
        } else {
            return children;
        }
    }
}

export default PublicRoute;
