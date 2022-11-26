package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo"
)

type Question struct {
	ID           int            `json:"id,omitempty"  db:"ID"`
	QuestionedOn string         `json:"questionedOn,omitempty"  db:"QuestionedOn"`
	QuestionText string         `json:"questionText,omitempty"  db:"QuestionText"`
	AnsweredOn   string         `json:"answeredOn,omitempty"  db:"AnsweredOn"`
	AnswererName string         `json:"answererName,omitempty"  db:"AnswererName"`
	AnswerText   sql.NullString `json:"answerText,omitempty"  db:"AnswerText"`
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

	e.GET("/question/:ID", getQuestionInfoHandler)

	e.Start(":4000")
}

func getQuestionInfoHandler(c echo.Context) error {
	ID := c.Param("ID")
	num, _ := strconv.Atoi(ID)

	questions := []Question{}
	err := db.Select(&questions, "SELECT * FROM question ORDER BY ID ASC")

	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(questions) <= num-1 || num-1 < 0 {
		return c.NoContent(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, questions[num-1])
}
