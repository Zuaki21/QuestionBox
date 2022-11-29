import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./questions.css";

function Questions() {
    const [questionsInfo, setQuestionsInfo] = useState();

    useEffect(() => {
        axios.get(`/api/questions`).then((res) => {
            setQuestionsInfo(res.data);
        });
    }, []);

    useEffect(() => {
        console.log(questionsInfo);
    }, [questionsInfo]);

    {
        if (questionsInfo) {
            return (
                <React.Fragment>
                    <h1 className="questionHead">あなたへの質問一覧</h1>
                    <div>
                        {questionsInfo.length === 0 ? (
                            <div>届いた質問はありません</div>
                        ) : (
                            ""
                        )}
                        {questionsInfo.map((questionInfo) => {
                            var date = new Date(questionInfo.questionedAt);
                            const dateText = `${date.getFullYear()}年${
                                date.getMonth() + 1
                            }月${date.getDate()}日`;
                            console.log(dateText);
                            let isAnsweredText = "未回答";
                            let isAnsweredClass = "isAnsweredFalse";
                            if (questionInfo.isAnswered) {
                                isAnsweredText = "回答済み";
                                isAnsweredClass = "isAnsweredTrue";
                            }
                            return (
                                <div className="questions">
                                    <a
                                        className="LinkBox"
                                        href={"/questions/" + questionInfo.id}
                                    >
                                        <div>
                                            <div className={isAnsweredClass}>
                                                {isAnsweredText}
                                            </div>
                                            <div className="questionText">
                                                {questionInfo.questionText}
                                            </div>
                                            <div className="questionedTime">
                                                質問日: {dateText}
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </React.Fragment>
            );
        }
    }
}

export default Questions;
