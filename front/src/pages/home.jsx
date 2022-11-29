import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Home() {
    const [usersInfo, setUsersInfo] = useState();

    useEffect(() => {
        axios.get(`/api/users`).then((res) => {
            setUsersInfo(res.data);
        });
    }, []);

    useEffect(() => {
        console.log(usersInfo);
    }, [usersInfo]);

    {
        if (usersInfo) {
            return (
                <div>
                    <h1>質問箱一覧</h1>

                    {usersInfo.map((userInfo) => {
                        return (
                            <div>
                                <a href={`/home/${userInfo.username}`}>
                                    {userInfo.username} の質問箱
                                </a>
                            </div>
                        );
                    })}
                </div>
            );
        }
    }
}

export default Home;
