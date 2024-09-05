const express = require('express');
const Comment = require('../schemas/comment');
const router = express.Router();
const fs = require('fs');


router.route('/comments/:id')
    //댓글 수정
    .put(async (req,res)=>{
        const comment = await Comment.findOne({id : req.params.id});
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
                    const comment = await Comment.updateOne({
                        id:req.params.id,//업데이트 대상 검색
                    },{
                        nickname: req.body.nickname,
                        content: req.body.content
                    });
                    
                    res.status.json({
                        id: comment.id,
                        nickname: comment.nickname,
                        content: comment.content,
                        createdAt: comment.createdAt.toISOString()
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
                fs.unlink('./public'+comment.imageUrl,(err)=>{
                    if(err){
                        console.error(err);
                    }
                 });
                await Comment.deleteOne({ id: req.params.id });
                 // 3. MySQL에서 그룹의 salt 정보 삭제
                 const deleteSaltSql = `DELETE FROM CommentSalt WHERE id = ?`;
                 mysqldb.query(deleteSaltSql, [comment.id], (err, result) => {
                     if (err) {
                         console.error("MySQL salt 삭제 오류:", err);
                     } else {
                         console.log("MySQL salt 삭제 성공");
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