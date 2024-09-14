const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const Comment = require('../schemas/comment');


router.route('/:id')
    //댓글 상세 조회
    .get(async (req,res)=>{
        try{
            const comment = await Comment.findOne({id : req.params.id});
            res.status(200).json({
                id:comment.id,
                groupId: comment.groupId,
                postId: comment.postId,
                nickname : comment.nickname,
                content : comment.content,
                createdAt : comment.createdAt.toISOString()
            });
        } catch(err){
            res.status(400).json({message : "잘못된 요청입니다"});
        }
    })
    //댓글 수정
    .put(async (req,res)=>{
        if(req.body==null){
            console.log("없음");
        }
        const comment = await Comment.findOne({id: req.params.id});
        if (!comment) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
        //비밀번호 검증
        const { mysqldb } = await setup();
        const sql = `SELECT salt FROM commentsalt WHERE id=?`;
        mysqldb.query(sql, [comment.id], async (err, rows, fields) => {
        if (err || rows.length === 0) {
            return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
        }
        try {
            const salt = rows[0].salt;
            const hashPw = sha(req.body.password + salt);
            if (comment.password == hashPw) {
                try{
                    await Comment.updateOne({
                        id:req.params.id,//업데이트 대상 검색
                    },{
                        nickname: req.body.nickname,
                        content: req.body.content
                    });
                    const updatedComment = await Comment.findOne({id:req.params.id});
                    res.status(200).json({
                        id: updatedComment.id,
                        nickname: updatedComment.nickname,
                        content: updatedComment.content,
                        createdAt: updatedComment.createdAt.toISOString()
                    });
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
    //댓글 삭제
    .delete(async (req,res)=>{
        const comment = await Comment.findOne({id: req.params.id});
        if (!comment) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
         //비밀번호 검증
         const { mysqldb } = await setup();
         const sql = `SELECT salt FROM CommentSalt WHERE id=?`;
         mysqldb.query(sql, [comment.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.password + salt);
             if (comment.password == hashPw){
                await Comment.deleteOne({ id: req.params.id });
                 // 3. MySQL에서 그룹의 salt 정보 삭제
                 const deleteSaltSql = `DELETE FROM CommentSalt WHERE id = ?`;
                 mysqldb.query(deleteSaltSql, [comment.id], (err, result) => {
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
    });
module.exports = router;