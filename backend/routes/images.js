// routes/imageRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const crypto = require('crypto');

// 설정: 업로드할 파일의 저장 위치와 고유한 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // 서버의 경로
  },
  filename: (req, file, cb) => {
    // 고유한 파일명을 위해 랜덤 해시값을 파일명에 추가
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname); // 파일 확장자
    cb(null, `${uniqueSuffix}${extension}`); // 고유한 파일명 생성
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 파일 크기 제한

// 파일 업로드 라우트
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 업로드된 파일의 URL 또는 경로를 응답으로 반환
    const imageUrl = `/images/${req.file.filename}`; // 고유한 파일명으로 변경됨
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('파일 업로드 중 오류 발생:', err);
    res.status(500).json({ error: '파일 업로드 중 오류 발생' });
  }
});


module.exports = router;
