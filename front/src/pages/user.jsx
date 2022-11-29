import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./questions.css";
import { useCallback } from "react";

function User() {
    const [questionsInfo, setQuestionsInfo] = useState();
    const { userName } = useParams();
    const [questionText, setQuestionText] = useState("");
    const [alertText, setAlertText] = useState("");
    useEffect(() => {
        axios.get(`/api/questions/answered/user/${userName}`).then((res) => {
            setQuestionsInfo(res.data);
        });
    }, [userName]);

    useEffect(() => {
        console.log(questionsInfo);
    }, [questionsInfo]);

    const onClickHandler = useCallback(
        (e) => {
            e.preventDefault();
            axios
                .post(`/api/questions/ask/${userName}`, {
                    questionText: questionText,
                })
                .then((e) => {
                    window.location.reload();
                })
                .catch((e) => {
                    if (e.response.status === 400) {
                        setAlertText("項目が空です");
                    }
                });
        },
        [questionText]
    );

    {
        if (questionsInfo) {
            return (
                <React.Fragment>
                    <h1 className="questionHead">{userName}さんの質問箱</h1>
                    <div className="question new">
                        <div>
                            <div className="questionLabel">新しい質問</div>
                            <form className="isDisplay">
                                <div className="alertLabel">{alertText}</div>
                                <div>
                                    <textarea
                                        type="text"
                                        id="answerText"
                                        value={questionText}
                                        onChange={(e) =>
                                            setQuestionText(e.target.value)
                                        }
                                        placeholder="回答を入力してください"
                                    ></textarea>
                                </div>
                                <div className="submitbutton">
                                    <button
                                        type="submit"
                                        onClick={onClickHandler}
                                    >
                                        送信
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <hr/>
                    <h1 className="questionHead">{userName}さんの回答一覧</h1>
                    <div>
                        {questionsInfo.length === 0 ? (
                            <div>回答した質問はありません</div>
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
                                        href={`/home/${userName}/${questionInfo.id}`}
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
                    <div><a href="/home">ホームに戻る</a></div>
                </React.Fragment>
            );
        }
    }
}
export default User;
