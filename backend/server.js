const dotenv = require("dotenv").config();
const setup = require("./db_setup");
const path = require('path');
const express = require("express");
const app = express();

const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://port-0-codeit-backend-m17jqg0915c4a4f2.sel4.cloudtype.app",
      "https://web-codeit-m197srmje0e2a98e.sel4.cloudtype.app",
      "http://localhost:8080",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, // 이 옵션을 통해 자격 증명을 허용합니다.
  })
);
// Preflight 요청에 대한 응답을 처리
app.options('*', cors());
res.header('Access-Control-Allow-Origin', '*'); // 또는 특정 도메인
res.header('Access-Control-Allow-Credentials', 'true');

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


















