const dotenv = require("dotenv").config();
const setup = require("./db_setup");
const express = require("express");
const app = express();

app.use(express.static("public")); //static 미들웨어 설정

////////////// body-parser 라이브러리 추가
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

///////////// session 설정
const session = require("express-session");
app.use(
  session({
    secret: "암호화키",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 15 } // 세션 유효 기간 (15분)
  })
);

//라우팅 
app.get("/", (req, res) => {
  res.render("index.html");
});

//라우팅 포함하는 코드
const groupsRouter = require('./routes/groups.js');
//const postsRouter = require('./routes/posts.js');
//const postsRouter = require('./routes/comments.js');

app.use('/api/groups', groupsRouter);
//app.use('/api/posts', postsRouter);
//app.use('/api/comments', commentsRouter);

app.listen(process.env.WEB_PORT, async () => {
  await setup();
  console.log("8080 서버가 준비되었습니다...");
});


















