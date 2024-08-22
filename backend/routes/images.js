// routes/imageRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 설정: 업로드할 파일의 저장 위치와 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../frontend/public/images')); // 서버의 경로
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 파일명 설정
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 파일 크기 제한

// 파일 업로드 라우트
router.post('/api/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('서버에 파일 첨부하기', req.file.path);

    // 업로드된 파일의 URL 또는 경로를 응답으로 반환
    const imageUrl = `/images/${req.file.originalname}`;
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('파일 업로드 중 오류 발생:', err);
    res.status(500).json({ error: '파일 업로드 중 오류 발생' });
  }
});

module.exports = router;
