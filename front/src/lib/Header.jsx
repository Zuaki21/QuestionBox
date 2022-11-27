import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Route } from "react-router-dom";
import "./Header.css";

function Header({ children }) {
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
            const elements = [
                <header>
                    <div>
                        <a href="/login">ログインはこちら</a>
                    </div>
                    <div>
                        <a href="/signup">新規登録はこちら</a>
                    </div>
                </header>,
                children,
            ];
            return elements;
        }
    }
}

export default Header;
