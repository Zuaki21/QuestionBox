import axios from "axios";
import { useCallback, useState } from "react";
import { Navigate, Route } from "react-router-dom";
import "./login.css";
function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alertText, setAlertText] = useState("");

    const onClickHandler = useCallback(
        (e) => {
            e.preventDefault();
            axios
                .post("/api/signup", {
                    username: username,
                    password: password,
                })
                .then((e) => {
                    if (e.status === 201) {
                        //作成を確認したら続けてログインする
                        axios
                            .post("/api/login", {
                                username: username,
                                password: password,
                            })
                            .then((e) => {
                                if (e.status === 200) {
                                    window.location.reload();
                                }
                            });
                    }
                })
                .catch((e) => {
                    if (e.response.status === 409) {
                        setAlertText("同じユーザー名が既に存在します");
                    } else if (e.response.status === 400) {
                        setAlertText("項目が空です");
                    }
                });
        },
        [username, password]
    );
    return (
        <div>
            <h1>ユーザー登録</h1>
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
                        登録
                    </button>
                </div>
            </form>
            <div>
                <a href="/login">ログインはこちら</a>
            </div>
        </div>
    );
}

export default Signup;
