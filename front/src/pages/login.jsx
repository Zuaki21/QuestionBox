import axios from "axios";
import { useCallback, useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const onClickHandler = useCallback(
        (e) => {
            e.preventDefault();
            axios.post("/api/login", {
                username: username,
                password: password,
            });
        },
        [username, password]
    );

    return (
        <div>
            <h1>ログインページ</h1>
            <form>
                <div>
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
        </div>
    );
}

export default Login;
