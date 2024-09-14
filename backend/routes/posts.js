const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const fs = require('fs');
const path = require('path');
router.route('/:id')
    //게시글 수정
    .put(async (req,res)=>{
        const post = await Post.findOne({id:req.params.id});
        if (!post) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
        //비밀번호 검증
        const { mysqldb } = await setup();
        const sql = `SELECT salt FROM postsalt WHERE id=?`;
        mysqldb.query(sql, [post.id], async (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
        }
        try {
            const salt = rows[0].salt;
            const hashPw = sha(req.body.postPassword + salt);
            if (post.postPassword === hashPw) {
                try{
                    const oldImageUrl = path.join(__dirname, '../public', post.imageUrl);
                    await Post.updateOne({
                        id:req.params.id,//업데이트 대상 검색
                    },{
                        nickname: req.body.nickname,
                        title : req.body.title,
                        content : req.body.content,
                        imageUrl: req.body.imageUrl,
                        tags: req.body.tags,
                        location: req.body.location,
                        moment: req.body.moment,
                        isPublic: req.body.isPublic
                    });
                    // 업데이트된 그룹 정보 가져오기
                    const updatedPost = await Post.findOne({ id: req.params.id });
                    //이미지 새 이미지로 로컬에서 교체
                    fs.rename(oldImageUrl,('./public/'+post.imageUrl),(err)=>{
                        if(err){
                            console.error(err);
                        }
                    });
            
                    // 응답으로 보낼 데이터 형식 조정
                    const response = {
                        id: updatedPost.id,
                        groupId: updatedPost.groupId,
                        nickname: updatedPost.nickname,
                        title: updatedPost.title,
                        content: updatedPost.content,
                        imageUrl: updatedPost.imageUrl,
                        tags: updatedPost.tags,
                        location: updatedPost.location,
                        moment: updatedPost.moment,
                        isPublic: updatedPost.isPublic,
                        likeCount: updatedPost.likeCount,
                        commentCount: updatedPost.commentCount,
                        createdAt: updatedPost.createdAt.toISOString() // ISO 형식으로 변환
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
        const post = await Post.findOne({id:req.params.id});
        if (!post) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
         //비밀번호 검증
         const { mysqldb } = await setup();
         const sql = `SELECT salt FROM PostSalt WHERE id=?`;
         mysqldb.query(sql, [post.id], async (err, rows) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.postPassword + salt);
             if (post.postPassword == hashPw){
                fs.unlink('./public'+post.imageUrl,(err)=>{
                    if(err){
                        console.error(err);
                    }
                 });
                await Post.deleteOne({ id: req.params.id });
                // 게시글에 관련된 댓글 삭제
                await Comment.deleteMany({ postId: req.params.id });
                 // MySQL에서 그룹의 salt 정보 삭제
                 const deleteSaltSql = `DELETE FROM PostSalt WHERE id = ?`;
                 mysqldb.query(deleteSaltSql, [post.id], (err) => {
                     if (err) {
                         console.error("MySQL salt 삭제 오류:", err);
                     } 
                 });
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
        const post = await Post.findOne({id:req.params.id});
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
        });
        }catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }

    });
//게시글 조회 권한 확인
router.post('/:id/verify-password',async(req,res)=>{
    const post = await Post.findOne({id:req.params.id});
         //비밀번호 검증
         const { mysqldb } = await setup();
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
});
//게시글 공감하기
router.post('/:id/like',async (req,res)=>{
    try{
        await Post.updateOne({
            id:req.params.id,//업데이트 대상 검색
        },{
            likeCount : (likeCount+1),
        });
        res.status(200).json({message : "그룹 공감하기 성공"});
    }catch(err){
        res.status(404).json({message : "존재하지 않습니다"});
    }
});
//게시글 공개 여부 확인
router.get('/:id/is-public',async (req,res)=>{
    //파라미터를 :id로 받아옴
    const post = await Post.findOne({id:req.params.id}, 'isPublic');
    res.status(200).json({
        id: post.id,
        isPublic: post.isPublic
    });
});

//댓글
router.route('/:id/comments')
    //댓글 등록
    .post(async(req,res)=>{
        if(req.session){
            const { mysqldb } = await setup();
            try{
                const generateSalt = (length = 16) => {
                    const crypto = require('crypto');
                    return crypto.randomBytes(length).toString('hex');
                  };
                const salt = generateSalt();
                req.body.password=sha(req.body.password+salt);
                const post = await Post.findOne({id : req.params.id});
                const comment = await Comment.create({
                    postId : req.params.id,
                    groupId : post.groupId,
                    nickname: req.body.nickname,
                    content : req.body.content,
                    password: req.body.password
                });
                const sql = `INSERT INTO CommentSalt(id, salt) VALUES (?, ?)`;
                //id는 자동생성 값이므로 post.id로 사용해야함 req.body X
                mysqldb.query(sql, [comment.id, salt], (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("salt 저장 성공");
                  }
                });
                // 응답으로 보낼 데이터 형식 조정
                const response = {
                    id: comment.id,
                    nickname: comment.nickname,
                    content: comment.content,
                    createdAt: comment.createdAt.toISOString() // ISO 형식으로 변환
                };
                res.status(200).json(response);
            }catch(err){
                res.status(400).json({message : "잘못된 요청입니다."});
            }
        }else{
            res.status(400).json({err: '잘못된 요청입니다.'});
        }
    })
    //댓글 목록 조회
    .get(async(req,res)=>{
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;
        const keyword = req.query.keyword || ''
        const postId = req.params.id;

        try {
            let filter = {};
            if (keyword) {
                filter.name = { $regex: keyword, $options: 'i' };
            }
            if (postId){
                filter.postId = postId;
            }
            const totalCommentCount = await Comment.countDocuments(filter);
    
            const comments = await Comment.find(filter)
                .skip(skip)
                .limit(pageSize);

            // 응답으로 보낼 데이터 형식 조정
            const response = {
                currentPage: page,
                totalPages: Math.ceil(totalCommentCount / pageSize),
                totalCommentCount: totalCommentCount,
                data: comments.map(comment => ({
                    id: comment.id,
                    nickname: comment.nickname,
                    content: comment.content,
                    createdAt: comment.createdAt.toISOString() // ISO 형식으로 변환
                }))
            };
            // 응답 보내기
            res.status(200).json(response);

        } catch (err) {
            res.status(400).json({ error: '잘못된 요청입니다' });
        }
    });

module.exports = router;