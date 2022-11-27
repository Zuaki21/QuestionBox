import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

function Question() {
    const { questionID } = useParams();
    const [questionInfo, setQuestionInfo] = useState();
    const [answerText, setAnswerText] = useState("");
    const [alertText, setAlertText] = useState("");

    useEffect(() => {
        axios.get(`/api/questions/${questionID}`).then((res) => {
            setQuestionInfo(res.data);
        });
    }, [questionID]);

    useEffect(() => {
        console.log(questionInfo);
    }, [questionInfo]);

    const onClickHandler = useCallback(
        (e) => {
            e.preventDefault();
            axios
                .post(`/api/questions/${questionID}`, {
                    answerText: answerText,
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
        [answerText]
    );

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

            console.log(questionDateText);
            let isAnsweredText = "未回答";
            let isAnsweredDisplay = "isNotDisplay";
            let isNotAnsweredDisplay = "isDisplay";
            if (questionInfo.isAnswered) {
                isAnsweredText = "回答済み";
                isAnsweredDisplay = "isDisplay";
                isNotAnsweredDisplay = "isNotDisplay";
            }

            return (
                <React.Fragment>
                    <h1 className="questionHead">{isAnsweredText}の質問です</h1>
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

                            <div
                                className={"questionText " + isAnsweredDisplay}
                            >
                                {questionInfo.answerText}
                            </div>
                            <form className={isNotAnsweredDisplay}>
                                <div className="alertLabel">{alertText}</div>
                                <div>
                                    <textarea
                                        type="text"
                                        id="answerText"
                                        value={answerText}
                                        onChange={(e) =>
                                            setAnswerText(e.target.value)
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
                            <div
                                className={
                                    "questionedTime " + isAnsweredDisplay
                                }
                            >
                                回答投稿: {answerDateText}
                            </div>
                        </div>
                    </div>
                    <a href={"/questions"}>質問一覧に戻る</a>
                </React.Fragment>
            );
        }
    }
}

export default Question;
