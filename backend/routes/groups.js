const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const Group = require('../schemas/group');
const Post = require('../schemas/post');


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

            // 응답으로 보낼 데이터 형식 조정
            const response = {
                currentPage: page,
                totalPages: Math.ceil(totalGroupCount / pageSize),
                totalGroupCount: totalGroupCount,
                data: groups.map(group => ({
                    id: group.id,
                    name: group.name,
                    imageUrl: group.imageUrl,
                    isPublic: group.isPublic,
                    likeCount: group.likeCount,
                    badges: group.badges,
                    postCount: group.postCount,
                    createdAt: group.createdAt.toISOString(),
                    introduction: group.introduction
                }))
            };
            // 응답 보내기
            res.status(200).json(response);

        } catch (err) {
            console.error('Error fetching groups:', err);
            res.status(500).json({ error: '서버 오류' });
        }
    })
    //그룹 등록
    .post(async (req,res)=>{
        if(req.session){
            const { mysqldb } = await setup();
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
                const sql = `INSERT INTO groupsalt(id, salt) VALUES (?, ?)`;
                //id는 자동생성 값이므로 group.id로 사용해야함 req.body X
                mysqldb.query(sql, [group.id, salt], (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("salt 저장 성공");
                  }
                });
                // 응답으로 보낼 데이터 형식 조정
                const response = {
                    id: group.id,
                    name: group.name,
                    imageUrl: group.imageUrl,
                    isPublic: group.isPublic,
                    likeCount: group.likeCount,
                    badges: group.badges,
                    postCount: group.postCount,
                    createdAt: group.createdAt.toISOString(), // ISO 형식으로 변환
                    introduction: group.introduction
                };
                console.log(response);
                res.status(201).json(response);
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
        const group = await Group.findOne({id:req.params.id});
        if (!group) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
        const { mysqldb } = await setup();
        //비밀번호 검증
        const sql = `SELECT salt FROM groupsalt WHERE id=?`;
        mysqldb.query(sql, [group.id], async (err, rows, fields) => {
        if (err || rows.length === 0) {
            return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
        }
        try {
            const salt = rows[0].salt;
            const hashPw = sha(req.body.verifyPassword + salt);
            if (group.password == hashPw) {
                try{
                    const generateSalt = (length = 16) => {
                        const crypto = require('crypto');
                        return crypto.randomBytes(length).toString('hex');
                      };
                    const salt = generateSalt();
                    req.body.password = sha(req.body.password+salt);
                    const result = await Group.updateOne({
                        id:req.params.id,//업데이트 대상 검색
                    },{
                        name: req.body.name,
                        password: req.body.password,
                        imageUrl: req.body.imageUrl,
                        isPublic: req.body.isPublic, 
                        introduction: req.body.introduction,
                    });
                    res.status(200).json({
                        id: group.id,
                        name: group.name,
                        imageUrl: group.imageUrl,
                        isPublic: group.isPublic,
                        likeCount: group.likeCount,
                        badges: group.badges,
                        postCount: group.postCount,
                        createdAt: group.createdAt.toISOString(), // ISO 형식으로 변환
                        introduction: group.introduction});
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
        const group = await Group.findOne({id:req.params.id});
        if (!group) {
            return res.status(404).json({ success: false, message: "존재하지 않습니다" });
        }
         //비밀번호 검증
         const { mysqldb } = await setup();
         const sql = `SELECT salt FROM GroupSalt WHERE id=?`;
         mysqldb.query(sql, [group.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.password + salt);
             if (group.password == hashPw){
                await Group.deleteOne({ id: req.params.id });
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
            const group = await Group.findOne({ id: req.params.id });
            res.status(200).json({
                id: group.id,
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
    const group = await Group.findOne({ id: req.params.id });
         //비밀번호 검증
         const { mysqldb } = await setup();
         const sql = `SELECT salt FROM groupsalt WHERE id=?`;
         mysqldb.query(sql, [group.id], async (err, rows, fields) => {
         if (err || rows.length === 0) {
             return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
         }
         try {
             const salt = rows[0].salt;
             const hashPw = sha(req.body.password + salt);
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
        await Group.updateOne({
           id:req.params.id,//업데이트 대상 검색
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
    const group = await Group.findOne({id:req.params.id}, 'isPublic');
    res.status(200).json({
        id: group.id,
        isPublic: group.isPublic
    });
});

//게시글
router.route('/:id/posts')
    //게시글 등록
    .post(async (req,res)=>{
        if(req.session){
            const { mysqldb } = await setup();
            try{
                const generateSalt = (length = 16) => {
                    const crypto = require('crypto');
                    return crypto.randomBytes(length).toString('hex');
                  };
                const salt = generateSalt();
                req.body.postPassword=sha(req.body.postPassword+salt);
                const post = await Post.create({
                    groupId: req.params.id,
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
                const sql = `INSERT INTO postsalt(id, salt) VALUES (?, ?)`;
                //id는 자동생성 값이므로 post.id로 사용해야함 req.body X
                mysqldb.query(sql, [post.id, salt], (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("salt 저장 성공");
                  }
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
                res.status(201).json(response);
            }catch(err){
                console.error(err);
            }
        }
        //게시글 등록 세션이 만료됐을 때
        else{
            res.status(400).json({err: '잘못된 요청입니다.'});
        }
    })
    //게시글 목록 조회
    .get(async (req,res)=>{
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;
        const sortBy = req.query.sortBy || 'latest';
        const keyword = req.query.keyword || '';
        const isPublic = req.query.isPublic; // 공개/비공개 여부를 쿼리 파라미터로 받음
        const groupId = req.query.groupId;

        let sortOption = { createdAt: -1 };
    
        if (sortBy === 'mostCommented') {
            sortOption = { commentCount: -1 };
        } else if (sortBy === 'mostLiked') {
            sortOption = { likeCount: -1 };
        } 
    
        try {
            let filter = {};
            if (keyword) {
                filter.name = { $regex: keyword, $options: 'i' };
            }
    
            if (isPublic !== undefined) {
                filter.isPublic = isPublic === 'true'; // 'true'는 boolean true로 변환
            }
            if (groupId) {
                filter.groupId = groupId; // 그룹 ID 필터 추가
            }
            const totalPostCount = await Post.countDocuments(filter);
    
            const posts = await Post.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(pageSize);

            // 응답으로 보낼 데이터 형식 조정
            const response = {
                currentPage: page,
                totalPages: Math.ceil(totalPostCount / pageSize),
                totalPostCount: totalPostCount,
                data: posts.map(post => ({
                    id: post.id,
                    nickname: post.nickname,
                    title: post.title,
                    imageUrl: post.imageUrl,
                    tags: post.tags,
                    location: post.location,
                    moment: post.moment,
                    isPublic: post.isPublic,
                    likeCount: post.likeCount,
                    commentCount: post.commentCount,
                    createdAt: post.createdAt.toISOString() // ISO 형식으로 변환
                }))
            };
            console.log(response);
            // 응답 보내기
            res.status(200).json(response);

        } catch (err) {
            res.status(400).json({ error: '잘못된 요청입니다' });
        }
    })




module.exports = router;