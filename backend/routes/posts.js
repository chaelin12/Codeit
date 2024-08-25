const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const Post = require('../schemas/post');

router.route('/:id')
    //게시글 수정
    .put(async (req,res)=>{
        const post = await Post.findOne(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
        //비밀번호 검증
        const sql = `SELECT salt FROM postsalt WHERE id=?`;
        mysqldb.query(sql, [post.id], async (err, rows, fields) => {
        if (err || rows.length === 0) {
            return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
        }
        try {
            const salt = rows[0].salt;
            const hashPw = sha(req.body.verifyPassword + salt);
            if (post.postPassword == hashPw) {
                try{
                    const generateSalt = (length = 16) => {
                        const crypto = require('crypto');
                        return crypto.randomBytes(length).toString('hex');
                      };
                    const salt = generateSalt();
                    req.body.postPassword = sha(req.body.postPassword+salt);
                    await Post.updateOne({
                        id:req.params.postId,//업데이트 대상 검색
                    },{
                        nickname: req.body.name,
                        title : req.body.title,
                        content : req.body.content,
                        postPassword: req.body.postPassword,
                        imageUrl: req.body.imageUrl,
                        tags: req.body.tags,
                        location: req.body.location,
                        moment: req.body.moment,
                        isPublic: req.body.isPublic
                    });
                    // 응답으로 보낼 데이터 형식 조정
                    const response = {
                        id: post.id,
                        groupId: post.groupId,
                        nickname: post.nickname,
                        title: post.title,
                        content: post.content,
                        imageUrl: post.imageUrl,
                        tags: post.tags,
                        location: post.location,
                        moment: post.moment,
                        isPublic: post.isPublic,
                        likeCount: post.likeCount,
                        commentCount: post.commentCount,
                        createdAt: post.createdAt.toISOString() // ISO 형식으로 변환
                    };
                    res.status(200).json(response);
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
    //게시글 삭제
    .delete(async (req,res)=>{
        const post = await Post.findOne(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
         //비밀번호 검증
         const sql = `SELECT salt FROM PostSalt WHERE id=?`;
         mysqldb.query(sql, [post.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.postPassword + salt);
             if (post.postPassword == hashPw){
                await Post.deleteOne({ id: req.params.postId });
                res.status(200).json({message : "게시글 삭제 성공"});
            }else{
                res.status(403).json({message : "비밀번호가 틀렸습니다"})
            }
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
    })
    //게시글 상세 정보 조회
    .get(async (req,res)=>{
        try{
        const post = await Post.findOne(req.params.postId);
        res.status(200).json({
            id: post.id,
            groupId: post.groupId,
            nickname: post.nickname,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            tags: post.tags,
            location: post.location,
            moment: post.moment,
            isPublic: post.isPublic,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            createdAt: post.createdAt.toISOString()
        })
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }

    });
//게시글 조회 권한 확인
router.post('/:id/verify-password',async(req,res)=>{
    const post = await Post.findOne(req.params.postId);
         //비밀번호 검증
         const sql = `SELECT salt FROM postsalt WHERE id=?`;
         mysqldb.query(sql, [post.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.password + salt);
             if (post.postPassword == hashPw){
                res.status(200).json({message : "비밀번호가 확인되었습니다"});
            }else{
                res.status(401).json({message : "비밀번호가 틀렸습니다"})
            }
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
})
//게시글 공감하기
router.post('/:id/like',async (req,res)=>{
    try{
        await Post.updateOne({
            id:req.params.postId,//업데이트 대상 검색
        },{
            likeCount : (likeCount+1),
        });
        res.status(200).json({message : "그룹 공감하기 성공"});
    }catch(err){
        res.status(404).json({message : "존재하지 않습니다"});
    }
})
//게시글 공개 여부 확인
router.get('/:id/is-public',async (req,res)=>{
    const post = await Post.findOne(req.params.postId, 'isPublic');
    res.status(200).json({
        id: post.id,
        isPublic: post.isPublic
    });
})
module.exports = router;