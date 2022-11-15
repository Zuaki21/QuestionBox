# QuestionBox書置き
まずはDockerDesktopを起動

## echoの起動
コマンドプロンプト上で
```
.\env.bat
go run main.go
npm run dev
```
## Mysqlの起動
```
mysql -h 127.0.0.1 -u root -p
```

## Password
```
Zuaki
Zuakipassword
```

## テーブル生成時の文
```
CREATE TABLE question (ID INT NOT NULL AUTO_INCREMENT, QuestionedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP, QuestionText VARCHAR(256) NOT NULL, AnsweredOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, AnswererName VARCHAR(10) NOT NULL, AnswerText VARCHAR(256), PRIMARY KEY (ID));

INSERT INTO question (QuestionText, AnswererName) VALUES ("こんにちは！","Zuaki");
```