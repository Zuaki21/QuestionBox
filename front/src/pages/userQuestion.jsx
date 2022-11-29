import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

function UserQuestion() {
    const { userName } = useParams();
    const { questionID } = useParams();
    const [questionInfo, setQuestionInfo] = useState();

    useEffect(() => {
        axios
            .get(`/api/questions/answered/user/${userName}/id/${questionID}`)
            .then((res) => {
                setQuestionInfo(res.data);
            });
    }, [questionID]);

    useEffect(() => {
        console.log(questionInfo);
    }, [questionInfo]);

    {
        if (questionInfo) {
            var date = new Date(questionInfo.questionedAt);
            const questionDateText = `${date.getFullYear()}年${
                date.getMonth() + 1
            }月${date.getDate()}日`;

            var date = new Date(questionInfo.answeredAt);
            const answerDateText = `${date.getFullYear()}年${
                date.getMonth() + 1
            }月${date.getDate()}日`;

            return (
                <React.Fragment>
                    <h1 className="questionHead">{userName}さんの回答</h1>
                    <div className="question">
                        <div>
                            <div className="questionLabel">質問</div>
                            <div className="questionText">
                                {questionInfo.questionText}
                            </div>
                            <div className="questionedTime">
                                質問日: {questionDateText}
                            </div>
                        </div>
                    </div>
                    <div className="question answer">
                        <div>
                            <div className="questionLabel">回答</div>

                            <div className="questionText isDisplay">
                                {questionInfo.answerText}
                            </div>
                            <div className="questionedTime isDisplay">
                                回答投稿: {answerDateText}
                            </div>
                        </div>
                    </div>
                    <a href={`/home/${userName}`}>
                        {userName}さんの回答一覧に戻る
                    </a>
                </React.Fragment>
            );
        }
    }
}

export default UserQuestion;
