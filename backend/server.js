const dotenv = require("dotenv").config();
const setup = require("./db_setup");
const path = require('path');
const express = require("express");
const app = express();

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000' // 프론트엔드 서버의 주소
}));

////////////// body-parser 라이브러리 추가
const bodyParser = require("body-parser");
app.use(express.json());

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
// 정적 파일 제공 설정
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, '../frontend/build')));
// 모든 요청에 대해 index.html 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
//라우팅 포함하는 코드
const imagesRouter = require('./routes/images.js');
const groupsRouter = require('./routes/groups.js');
const postsRouter = require('./routes/posts.js');
const commentsRouter = require('./routes/comments.js');

app.use('/api/image', imagesRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

app.listen(process.env.WEB_PORT, async () => {
  await setup();
  console.log("8080 서버가 준비되었습니다...");
});


















