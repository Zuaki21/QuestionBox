import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Questions() {
    const [questionInfoes, setQuestionInfoes] = useState();

    useEffect(() => {
        axios.get(`/api/questions`).then((res) => {
            setQuestionInfoes(res.data);
        });
    }, []);

    useEffect(() => {
        console.log(questionInfoes);
    }, [questionInfoes]);

    {
        if (questionInfoes) {
            return (
                <React.Fragment>
                    <h1>質問一覧</h1>
                    <div className="questions">
                        {questionInfoes.map((questionInfoes) => {
                            var date = new Date(questionInfoes.questionedAt);
                            const dateText = `${date.getFullYear()}年${
                                date.getMonth() + 1
                            }月${date.getDate()}日`;
                            console.log(dateText);
                            let isAnsweredText = "未回答";
                            let isAnsweredClass = "isAnsweredFalse";
                            if (questionInfoes.isAnswered) {
                                isAnsweredText = "回答済み";
                                isAnsweredClass = "isAnsweredTrue";
                            }
                            return (
                                <div className="question">
                                    <a
                                        className="LinkBox"
                                        href={"/questions/" + questionInfoes.id}
                                    >
                                        <div>
                                            <div className={isAnsweredClass}>
                                                {isAnsweredText}
                                            </div>
                                            <div className="questionText">
                                                {questionInfoes.questionText}
                                            </div>
                                            <div className="questionedTime">
                                                質問投稿: {dateText}
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
