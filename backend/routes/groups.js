const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Group = require('../schemas/group');
const session = require('express-session')

const storage=multer.diskStorage({
    destination: (req, file, done) => {
    done(null, '../frontend/public/images')
    }, filename: (req, file, done) => {
      done(null, file.originalname)
    }
  });
  const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 파일 크기 제한
////////파일 첨부 처리
let imageUrl = '';
router.post('/api/image',upload.single('image') , (req, res) => {
  console.log('서버에 파일 첨부하기', req.file.path);
  imageUrl =  req.file.originalname;
});
router.route('/')
    //그룹 목록 조회
    .get(async (req,res)=>{
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;
        const sortBy = req.query.sortBy || 'latest';
        const keyword = req.query.keyword || '';
        const isPublic = req.query.isPublic; // 공개/비공개 여부를 쿼리 파라미터로 받음
    
        let sortOption = { createdAt: -1 };
    
        if (sortBy === 'mostPosted') {
            sortOption = { postCount: -1 };
        } else if (sortBy === 'mostLiked') {
            sortOption = { likeCount: -1 };
        } else if (sortBy === 'mostBadge') {
            sortOption = { badgeCount: -1 };
        }
    
        try {
            let filter = {};
            if (keyword) {
                filter.name = { $regex: keyword, $options: 'i' };
            }
    
            if (isPublic !== undefined) {
                filter.isPublic = isPublic === 'true'; // 'true'는 boolean true로 변환
            }
    
            const totalGroupCount = await Group.countDocuments(filter);
    
            const groups = await Group.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(pageSize);
    
            res.json({
                currentPage: page,
                totalPages: Math.ceil(totalGroupCount / pageSize),
                totalGroupCount: totalGroupCount,
                data: groups
            });
        } catch (err) {
            console.error('Error fetching groups:', err);
            res.status(500).json({ error: '서버 오류' });
        }
    })
    //그룹 등록
    .post(upload.single('image'),async (req,res)=>{
        if(req.session){
            try{
                const generateSalt = (length = 16) => {
                    const crypto = require('crypto');
                    return crypto.randomBytes(length).toString('hex');
                  };
                const salt = generateSalt();
                req.body.password=sha(req.body.password+salt);
                const group = await Group.create({
                    name: req.body.name,
                    password: req.body.password,
                    imageUrl: req.body.imageUrl,
                    isPublic: req.body.isPublic, 
                    introduction: req.body.introduction,
                })
                const sql = `INSERT INTO usersalt(userid, salt) VALUES (?, ?)`;
                mysqldb.query(sql, [req.params.id, salt], (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("salt 저장 성공");
                  }
                });
                console.log(group);
                res.status(201).json(group);
            }catch(err){
                console.error(err);
            }
        }
        //그룹 등록 세션이 만료됐을 때
            else{
                res.status(400).json({err: '잘못된 요청입니다.'});
            }
});

module.exports = router;
router.route('/:id')
    //그룹 수정
    .put(async (req,res)=>{
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
        //비밀번호 검증
        const sql = `SELECT salt FROM UserSalt WHERE userid=?`;
        mysqldb.query(sql, [req.params.id], async (err, rows, fields) => {
        if (err || rows.length === 0) {
            return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
        }
        try {
            const salt = rows[0].salt;
            const hashPw = sha(password + salt);
            if (group.password == hashPw) {
                try{
                    const generateSalt = (length = 16) => {
                        const crypto = require('crypto');
                        return crypto.randomBytes(length).toString('hex');
                      };
                    const salt = generateSalt();
                    const result = await Group.update({
                        _id:req.params.id,//업데이트 대상 검색
                    },{
                        name: req.body.name,
                        password: sha(req.body.password+salt),
                        imageUrl: req.body.imageUrl,
                        isPublic: req.body.isPublic, 
                        introduction: req.body.introduction,
                    });
                    res.json(result);
                }catch(err){
                    console.error(err);
                }
        }else{
            res.status(403).json({message : "비밀번호가 틀렸습니다"})
        }
    }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
    })
    
    //그룹 삭제
    .delete(async(req,res)=>{ 
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
         //비밀번호 검증
         const sql = `SELECT salt FROM UserSalt WHERE userid=?`;
         mysqldb.query(sql, [req.params.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(password + salt);
             if (group.password == hashPw){
                await Group.deleteOne({ _id: req.params.id });
                res.status(200).json({message : "그룹 삭제 성공"});
            }else{
                res.status(403).json({message : "비밀번호가 틀렸습니다"})
            }
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
    })
    //그룹 상세 정보 확인
    .get(async(req,res)=>{
        try{
            const group = await Group.findById(req.params.id);
            res.status(200).json({
                id: group._id,
                name: group.name,
                imageUrl: group.imageUrl,
                isPublic: group.isPublic,
                likeCount: group.likeCount,
                badges: group.badges,
                postCount: group.postCount,
                createdAt: group.createdAt,
                introduction: group.introduction
            })
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    });
//그룹 조회 권한 확인
router.post('/:id/verify-password', async(req,res)=>{
    const group = await Group.findById(req.params.id);
         //비밀번호 검증
         const sql = `SELECT salt FROM UserSalt WHERE userid=?`;
         mysqldb.query(sql, [req.params.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(password + salt);
             if (group.password == hashPw){
                res.status(200).json({message : "비밀번호가 확인되었습니다"});
            }else{
                res.status(401).json({message : "비밀번호가 틀렸습니다"})
            }
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
});
//그룹 공감하기
router.post('/:id/like', async(req,res)=>{
    try{
        const result = await Group.update({
            _id:req.params.id,//업데이트 대상 검색
        },{
            likeCount : (likeCount+1),
        });
        res.status(200).json({message : "그룹 공감하기 성공"});
    }catch(err){
        res.status(404).json({message : "존재하지 않습니다"});
    }

});
//그룹 공개 여부 확인
router.get('/:id/is-public', async(req,res)=>{
    const result = await Group.findById(req.params.id, 'isPublic');
    res.status(200).json({
        id: req.params.id,
        isPublic: group.isPublic
    });
});