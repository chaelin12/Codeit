const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const router = express.Router();
const AWS = require('aws-sdk');

// AWS S3 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION // S3 버킷이 위치한 리전
});

// Multer 설정: 메모리 내에서 파일을 처리하도록 설정 (diskStorage 대신 memoryStorage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 파일 크기 제한

// 파일 업로드 라우트
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 고유한 파일명을 위해 랜덤 해시값을 파일명에 추가
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = req.file.originalname.split('.').pop(); // 파일 확장자
    const fileName = `${uniqueSuffix}.${extension}`; // 고유한 파일명 생성

    // S3 업로드 설정
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // 업로드할 S3 버킷 이름
      Key: fileName, // S3에 저장될 파일명
      Body: req.file.buffer, // 파일 데이터 (buffer)
      ContentType: req.file.mimetype, // 파일 MIME 타입
      ACL: 'public-read' // 파일을 공개적으로 읽을 수 있도록 설정 (옵션)
    };

    // S3에 파일 업로드
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('S3 업로드 중 오류 발생:', err);
        return res.status(500).json({ error: 'S3 업로드 중 오류 발생' });
      }

      // 업로드된 파일의 URL을 응답으로 반환
      const imageUrl = data.Location; // S3에 업로드된 파일의 URL
      res.status(200).json({ imageUrl });
    });
  } catch (err) {
    console.error('파일 업로드 중 오류 발생:', err);
    res.status(500).json({ error: '파일 업로드 중 오류 발생' });
  }
});

module.exports = router;
