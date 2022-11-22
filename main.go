package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-sql-driver/mysql"
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
	IsAnswered	bool   `json:"isAnswered"  db:"IsAnswered"`
}

var (
	db *sqlx.DB
)

// 接続設定
func ConnectDB() *sqlx.DB {
	jst, err := time.LoadLocation("Local")
	if err != nil {
		log.Fatalf("Cannot Load Location: %s", err)
	}
	c := mysql.Config{
		DBName:    os.Getenv("DB_DATABASE"),
		User:      os.Getenv("DB_USERNAME"),
		Passwd:    os.Getenv("DB_PASSWORD"),
		Addr:      fmt.Sprintf("%s:%s", os.Getenv("DB_HOSTNAME"), os.Getenv("DB_PORT")),
		Net:       "tcp",
		ParseTime: true,
		Collation: "utf8mb4_unicode_ci",
		Loc:       jst,
	}
	db, err := sqlx.Connect("mysql", c.FormatDSN())
	if err != nil {
		log.Fatalf("Cannot Connect to Database: %s", err)
	}
	return db
}

func main() {
	db = ConnectDB()
	e := echo.New()

	e.GET("/questions/:ID", getQuestionInfoHandler)
	e.GET("/questions", getAllQuestionsInfoHandler)

	e.Start(":4000")
}

func getAllQuestionsInfoHandler(c echo.Context) error {
	questions := []Question{}
	err := db.Select(&questions, "SELECT * FROM question ORDER BY ID ASC")

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.NoContent(http.StatusNotFound)
		}
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, questions)
}

func getQuestionInfoHandler(c echo.Context) error {
	ID := c.Param("ID")
	num, _ := strconv.Atoi(ID)

	question := Question{}
	err := db.Get(&question, "SELECT * FROM question WHERE ID = ?", num)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.NoContent(http.StatusNotFound)
		}
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, question)
}
