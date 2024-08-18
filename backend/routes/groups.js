const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Group = require('../schemas/group');

const storage = multer.diskStorage({
    destination: (req, file, done) => {
        done(null, path.join(__dirname, '../public/image'));
    },
    filename: (req, file, done) => {
        done(null, file.originalname);
    }
});

const upload = multer({ storage });

let imagepath = '';

router.post('/post/photo', upload.single('picture'), (req, res) => {
    console.log("서버에 파일 첨부", req.file.path);
    imagepath = req.file.originalname;
    res.send('파일 업로드 성공');
});

router.get('/post/list', async (req, res) => {
    const { mongodb } = await setup();
    const groups = await mongodb.collection("group").find({}).toArray();
    res.json(groups);
});

router.post('/post/save', async (req, res) => {
    console.log(req.body);
    const { mongodb } = await setup();
    try {
        const result = await mongodb.collection("group").insertOne({
            name: req.body.name,
            password: req.body.password,
            path: imagepath,
            isPublic: req.body.view === 'true',
            intro: req.body.intro
        });
        res.json({ success: true, message: '저장 성공', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: '저장 실패', error });
    }
});

module.exports = router;
