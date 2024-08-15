const router = require("express").Router();
const setup = require(".../db_setup");
const sha = require("sha256");
const crypto = require('crypto');
const multer = require('multer');

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
