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
                    <div className="left">
                        <a href="/home">ホームに戻る</a>
                    </div>
                    <div className="right">
                        <div>
                            こんにちは{" "}
                            <a href="/questions">{UserInfo.username}</a> さん！
                        </div>
                        <div>
                            <a onClick={onClickHandler}>ログアウトする</a>
                        </div>
                    </div>
                </header>,
                children,
            ];
            return elements;
        } else {
            const elements = [
                <header>
                    <div className="left">
                        <a href="/home">ホームに戻る</a>
                    </div>
                    <div className="right">
                        <div>
                            <a href="/login">ログインはこちら</a>
                        </div>
                        <div>
                            <a href="/signup">新規登録はこちら</a>
                        </div>
                    </div>
                </header>,
                children,
            ];
            return elements;
        }
    }
}

export default Header;
