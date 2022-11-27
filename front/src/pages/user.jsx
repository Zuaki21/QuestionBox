import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./questions.css";

function User() {
    const [questionInfo, setQuestionInfo] = useState();
    useEffect(() => {
        axios.get(`/api///answered`).then((res) => {
            setQuestionInfo(res.data);
        });
    }, []);
    return (
        <React.Fragment>
            <h1 className="questionHead">あなたへの質問一覧</h1>
        </React.Fragment>
    );
}
export default User;
