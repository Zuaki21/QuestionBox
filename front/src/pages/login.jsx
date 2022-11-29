import axios from "axios";
import { useCallback, useState } from "react";
import { Navigate, Route } from "react-router-dom";
import "./login.css";
function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alertText, setAlertText] = useState("");

    const onClickHandler = useCallback(
        (e) => {
            e.preventDefault();
            axios
                .post("/api/login", {
                    username: username,
                    password: password,
                })
                .then((e) => {
                    if (e.status === 200) {
                        window.location.reload();
                    }
                })
                .catch((e) => {
                    setAlertText("ユーザー名またはパスワードが間違っています");
                });
        },
        [username, password]
    );
    const goBackHandler = useCallback((e) => {
        e.preventDefault();
        history.back(-1);
    }, []);

    return (
        <div>
            <h1>ログインページ</h1>
            <div>
                <a href="/signup">ユーザー登録はこちら</a>
            </div>
            <form>
                <div>
                    <div className="alertText">{alertText}</div>
                    <label htmlFor="username">ユーザー名: </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    ></input>
                </div>
                <div>
                    <label htmlFor="password">パスワード: </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    ></input>
                </div>
                <div>
                    <button type="submit" onClick={onClickHandler}>
                        ログイン
                    </button>
                </div>
            </form>
            <div>
                <a href="#" onClick={goBackHandler}>
                    戻る
                </a>
            </div>
        </div>
    );
}

export default Login;
