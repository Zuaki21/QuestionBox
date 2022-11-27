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

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/srinathgs/mysqlstore"
	"golang.org/x/crypto/bcrypt"

	"github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

type City struct {
	ID          int    `json:"id,omitempty"  db:"ID"`
	Name        string `json:"name,omitempty"  db:"Name"`
	CountryCode string `json:"countryCode,omitempty"  db:"CountryCode"`
	District    string `json:"district,omitempty"  db:"District"`
	Population  int    `json:"population,omitempty"  db:"Population"`
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
		User:      os.Getenv("DB_userName"),
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

	sessionLength := 60 * 60 * 24 * 7 // 7日間
	store, err := mysqlstore.NewMySQLStoreFromConnection(db.DB, "sessions", "/", sessionLength, []byte("secret-token"))
	if err != nil {
		panic(err)
	}

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(session.Middleware(store))

	withLogin := e.Group("")
	withLogin.Use(checkLogin)

	//質問関連
	e.POST("/questions//:userName", postQuestionInfoHandler)                       //新たな質問を投稿
	e.GET("/questions/:ID//answered", getAnsweredQuestionInfoByIDHandler)          //1つだけ回答済み質問を取得
	e.GET("/questions//:userName/answered", getAnsweredQuestionsInfoByUserHandler) //対象ユーザーの回答を取得
	e.GET("/questions///answered", getAllAnsweredQuestionsInfoHandler)             //全ての回答済み質問を取得
	e.GET("/hogehoge", getAllAnsweredQuestionsInfoHandler)                         //全ての回答済み質問を取得

	withLogin.GET("/questions/:ID", getQuestionInfoHandler)     //1つだけ質問を取得
	withLogin.POST("/questions/:ID", postQuestionAnswerHandler) //質問に回答
	withLogin.GET("/questions", getAllQuestionsInfoHandler)     //全ての質問を取得

	//ログイン関連
	e.POST("/login", postLoginHandler)
	e.POST("/signup", postSignUpHandler)
	withLogin.GET("/logout", postLogoutHandler)

	///実習編の時のもの(参考用 最終的に消す)
	withLogin.GET("/cities/:cityName", getCityInfoHandler)
	withLogin.GET("/countries/:countryCode", getCountriesHandler)
	withLogin.GET("/world", getWorldHandler)
	withLogin.GET("/whoami", whoAmIHandler)

	e.Start(":4000")
}

// ////ここからログイン関連の処理//////
type LoginRequestBody struct {
	Username string `json:"username,omitempty" form:"Username"`
	Password string `json:"password,omitempty" form:"password"`
}

type User struct {
	Username   string `json:"username,omitempty"  db:"Username"`
	HashedPass string `json:"-"  db:"HashedPass"`
}

func postSignUpHandler(c echo.Context) error {
	req := LoginRequestBody{}
	c.Bind(&req) //リクエストボディから取得

	// もう少し真面目にバリデーションするべき
	if req.Password == "" || req.Username == "" {
		// エラーは真面目に返すべき
		return c.String(http.StatusBadRequest, "項目が空です")
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("bcrypt generate error: %v", err))
	}

	// ユーザーの存在チェック
	var count int

	err = db.Get(&count, "SELECT COUNT(*) FROM users WHERE userName=?", req.Username)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("db error: %v", err))
	}

	if count > 0 {
		return c.String(http.StatusConflict, "ユーザーが既に存在しています")
	}

	_, err = db.Exec("INSERT INTO users (userName, HashedPass) VALUES (?, ?)", req.Username, hashedPass)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("db error: %v", err))
	}
	return c.NoContent(http.StatusCreated)
}

func postLoginHandler(c echo.Context) error {
	req := LoginRequestBody{}
	c.Bind(&req)

	//対象のユーザー情報をDBから取得
	user := User{}
	err := db.Get(&user, "SELECT * FROM users WHERE userName=?", req.Username)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("db error: %v", err))
	}

	//パスワードの照合
	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPass), []byte(req.Password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return c.NoContent(http.StatusForbidden)
		} else {
			return c.NoContent(http.StatusInternalServerError)
		}
	}

	//sessionにセッション情報を保存
	sess, err := session.Get("sessions", c) //セッション情報を取得
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "something wrong in getting session")
	}
	sess.Values["userName"] = req.Username
	// delete(sess.Values,"userName")
	sess.Save(c.Request(), c.Response())

	return c.NoContent(http.StatusOK)
}

func postLogoutHandler(c echo.Context) error {
	sess, err := session.Get("sessions", c)
	if err != nil {
		return c.String(http.StatusInternalServerError, "something wrong in getting session")
	}
	delete(sess.Values, "userName")
	sess.Save(c.Request(), c.Response())
	return c.String(http.StatusOK, "ログアウトしました")
}

// ログインしているかどうかをチェックするミドルウェア
func checkLogin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := session.Get("sessions", c)
		if err != nil {
			fmt.Println(err)
			return c.String(http.StatusInternalServerError, "something wrong in getting session")
		}

		if sess.Values["userName"] == nil {
			return c.String(http.StatusForbidden, "please login")
		}
		c.Set("userName", sess.Values["userName"].(string))
		return next(c)
	}
}

// /////////////////////////////////////////////////////////////////
// ////ここから質問関連の処理//////
type Question struct {
	ID           int       `json:"id,omitempty"  db:"ID"`
	QuestionedAt time.Time `json:"questionedAt,omitempty"  db:"QuestionedAt"`
	QuestionText string    `json:"questionText,omitempty"  db:"QuestionText"`
	AnsweredAt   time.Time `json:"answeredAt,omitempty"  db:"AnsweredAt"`
	AnswererName string    `json:"answererName,omitempty"  db:"AnswererName"`
	AnswerText   string    `json:"answerText,omitempty"  db:"AnswerText"`
	IsAnswered   bool      `json:"isAnswered"  db:"IsAnswered"`
}
type QuestionText struct {
	QuestionText string `json:"questionText,omitempty"  db:"QuestionText"`
}
type AnswerText struct {
	AnswerText string `json:"answerText,omitempty"  db:"AnswerText"`
}

func postQuestionAnswerHandler(c echo.Context) error {
	ID := c.Param("ID")
	num, _ := strconv.Atoi(ID)
	// リクエストボディから取得
	req := AnswerText{}
	err := c.Bind(&req)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("bind error: %v", err))
	}

	if req.AnswerText == "" {
		// エラーは真面目に返すべき
		return c.String(http.StatusBadRequest, "項目が空です")
	}
	// ログイン者を取得
	userName := c.Get("userName").(string)

	// DBに保存
	_, err = db.Exec("UPDATE question SET AnswerText=?, IsAnswered=? WHERE  AnswererName=? AND ID=?", req.AnswerText, true, userName, num)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("db error: %v", err))
	}

	return c.NoContent(http.StatusCreated)

}
func postQuestionInfoHandler(c echo.Context) error {
	userName := c.Param("userName")

	// リクエストボディから取得
	req := QuestionText{}
	err := c.Bind(&req)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("bind error: %v", err))
	}
	if req.QuestionText == "" {
		// エラーは真面目に返すべき
		return c.String(http.StatusBadRequest, "項目が空です")
	}
	// DBに保存
	_, err = db.Exec("INSERT INTO question (QuestionText, AnswererName) VALUES (?, ?)", req.QuestionText, userName)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("db error: %v", err))
	}

	return c.NoContent(http.StatusCreated)
}

func getAnsweredQuestionInfoByIDHandler(c echo.Context) error {
	ID := c.Param("ID")
	num, _ := strconv.Atoi(ID)

	question := Question{}
	err := db.Get(&question, "SELECT * FROM question WHERE ID = ? AND IsAnswered = true", num)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.NoContent(http.StatusNotFound)
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, question)
}
func getAnsweredQuestionsInfoByUserHandler(c echo.Context) error {
	questions := []Question{}
	userName := c.Param("userName")
	err := db.Select(&questions, "SELECT * FROM question WHERE AnswererName = ? AND IsAnswered = true ORDER BY ID ASC", userName)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.NoContent(http.StatusNotFound)
		}
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, questions)
}

func getAllAnsweredQuestionsInfoHandler(c echo.Context) error {
	questions := []Question{}
	err := db.Select(&questions, "SELECT * FROM question WHERE IsAnswered = true ORDER BY ID ASC")

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.String(http.StatusNotFound, err.Error())
		}
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, questions)
}
func getAllQuestionsInfoHandler(c echo.Context) error {
	questions := []Question{}
	userName := c.Get("userName").(string)
	err := db.Select(&questions, "SELECT * FROM question WHERE AnswererName = ? ORDER BY ID ASC", userName)

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
	userName := c.Get("userName").(string)

	question := Question{}
	err := db.Get(&question, "SELECT * FROM question WHERE AnswererName = ? AND ID = ?", userName, num)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.NoContent(http.StatusNotFound)
		}
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, question)
}

// ///////////////////////////////////////////////////////////////////
// ////ここから実習編の時のもの(参考用 最終的に消す)//////
func getCityInfoHandler(c echo.Context) error {
	cityName := c.Param("cityName")

	city := City{}
	db.Get(&city, "SELECT * FROM city WHERE Name=?", cityName)
	if city.Name == "" {
		return c.NoContent(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, city)
}

type Me struct {
	Username string `json:"username,omitempty"  db:"Username"`
}

func whoAmIHandler(c echo.Context) error {
	me := Me{}
	me.Username = c.Get("userName").(string)
	return c.JSON(http.StatusOK, me)
}

func getCountriesHandler(c echo.Context) error {
	countryCode := c.Param("countryCode")

	cities := []City{}
	err := db.Select(&cities, "SELECT * FROM city WHERE CountryCode=?", countryCode)

	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(cities) == 0 {
		return c.NoContent(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, cities)
}

type Country struct {
	Code       string `json:"code,omitempty"  db:"Code"`
	Name       string `json:"name,omitempty"  db:"Name"`
	Continent  string `json:"continent,omitempty"  db:"Continent"`
	Region     string `json:"region,omitempty"  db:"Region"`
	Population int    `json:"population,omitempty"  db:"Population"`
}

func getWorldHandler(c echo.Context) error {
	countries := []Country{}
	err := db.Select(&countries, "SELECT Code, Name, Continent, Region, Population FROM country ORDER BY Population DESC")

	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(countries) == 0 {
		return c.NoContent(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, countries)
}
