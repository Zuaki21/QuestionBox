package main

import (
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)


type Question struct {
	ID           int    `json:"id,omitempty"  db:"ID"`
	QuestionedOn string `json:"questionedOn,omitempty"  db:"QuestionedOn"`
	QuestionText string `json:"questionText,omitempty"  db:"QuestionText"`
	AnsweredOn   string `json:"answeredOn,omitempty"  db:"AnsweredOn"`
	AnswererName string    `json:"answererName,omitempty"  db:"AnswererName"`
	AnswerText   string `json:"answerText,omitempty"  db:"AnswerText"`
}

func main() {
	db, err := sqlx.Connect("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOSTNAME"), os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE")))
	if err != nil {
		log.Fatalf("Cannot Connect to Database: %s", err)
	}

	fmt.Println("Connected!")

	question := Question{}
	db.Get(&question, "SELECT * FROM question")
	fmt.Printf("%s: %s\n", question.AnswererName, question.QuestionText)


	questions := []Question{}
	db.Select(&questions, "SELECT * FROM question")

	fmt.Println("質問一覧")
	for _, question := range questions {
		fmt.Printf("%s: %s\n", question.AnswererName, question.QuestionText)
	}
}