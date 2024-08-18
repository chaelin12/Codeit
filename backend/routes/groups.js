const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Group = require('../schemas/group');
const session = requires('express-session')

const storage=multer.diskStorage({
    destination: (req, file, done) => {
    done(null, '/frontend/public/image')
    }, filename: (req, file, done) => {
      done(null, file.originalname)
    }, limit : 5*1024*1024
  });

router.route('/')
    //그룹 목록 조회
    .get(async (req,res)=>{
        try{
            const groups = await Group.find();
            console.log(groups);
            res.json(groups);
        }catch(err){
            res.status(400).json({err: '잘못된 요청입니다.'});
        }
    })
    //그룹 등록
    .post(async (req,res)=>{
        if(req.session){
            try{
                const group = await Group.create({
                    name: req.body.name,
                    password: req.body.password,
                    imageUrl: req.body.imageUrl,
                    isPublic: req.body.isPublic, 
                    introduction: req.body.introduction,
                })
                console.log(group);
                res.status(201).json(group);
            }catch(err){
                console.error(err);
            }
        }
        //그룹 등록 세션이 만료됐을 때
        // else{
        //     res.
        // }
    });

module.exports = router;
router.route('/:id')
    //그룹 수정
    .put(async(req,res)=>{
    
    })
    //그룹 삭제
    .delete(async(req,res)=>{

    })
    //그룹 상세 정보 확인
    .get(async(req,res)=>{

    });
//그룹 조회 권한 확인
router.post('/:id/verify-password', async(req,res)=>{

});
//그룹 공감하기
router.post('/:id/like', async(req,res)=>{

});
//그룹 공개 여부 확인
router.get('/:id/is-public', async(req,res)=>{

});