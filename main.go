package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo"
)

type Question struct {
	ID           int    `json:"id,omitempty"  db:"ID"`
	QuestionedAt string `json:"questionedAt,omitempty"  db:"QuestionedAt"`
	QuestionText string `json:"questionText,omitempty"  db:"QuestionText"`
	AnsweredAt   string `json:"answeredAt,omitempty"  db:"AnsweredAt"`
	AnswererName string `json:"answererName,omitempty"  db:"AnswererName"`
	AnswerText   string `json:"answerText,omitempty"  db:"AnswerText"`
}

var (
	db *sqlx.DB
)

func main() {
	_db, err := sqlx.Connect("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOSTNAME"), os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE")))
	if err != nil {
		log.Fatalf("Cannot Connect to Database: %s", err)
	}
	db = _db

	e := echo.New()

	e.GET("/questions", getAllQuestionsInfoHandler)
	e.GET("/questions/:ID", getQuestionInfoHandler)

	e.Start(":4000")
}

func getAllQuestionsInfoHandler(c echo.Context) error {
	questions := []Question{}
	err := db.Select(&questions, "SELECT * FROM question ORDER BY ID ASC")

	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(questions) == 0 {
		return c.NoContent(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, questions)
}

func getQuestionInfoHandler(c echo.Context) error {
	ID := c.Param("ID")

	question := Question{}
	db.Get(&question, "SELECT * FROM question WHERE ID = ?", c.Param(ID))

	if question.QuestionText == "" {
		return c.NoContent(http.StatusNotFound)
	}
	
	return c.JSON(http.StatusOK, question)
}
