const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const crypto = require('crypto');
const multer = require('multer');
const Group = require('../schemas/group');
const storage=multer.diskStorage({
    destination: (req, file, done) => {
    done(null, '../public/image')
    }, filename: (req, file, done) => {
      done(null, file.originalname)
    }, limit : 5*1024*1024
  });
  
const upload=multer({storage});

let imagepath='';
router.post('/post/photo',upload.single('picture'),(req,res)=>{
    console.log("서버에 파일 첨부",req.file.path);
    imagepath = req.file.originalname;
});

router.get('/post/list',async(req,res)=>{
    const{mongodb}=await setup();
    list(mongodb,req,res);
});
function list(mongodb,req,res){
    l
}
router.post('/post/save',async(req,res)=>{
    console.log(req.body);
    const { mongodb, mysqldb } = await setup();
    mongodb
    .collection("group")
    .findeOne
    mongodb
    .collection("group")
        .insertOne({
            name:req.body.name,
            password:req.body.password,
            path:imagepath,
            isPublic:req.body.view,
            intro:req.body.intro

        })

});
