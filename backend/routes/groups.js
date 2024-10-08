const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const Group = require('../schemas/group');
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const AWS = require('aws-sdk');
const checkSevenDayStreak = (posts) => {
    if (!posts || !Array.isArray(posts)) return false;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const postsInLastSevenDays = posts.filter(post => new Date(post.createdAt) >= sevenDaysAgo);
    return postsInLastSevenDays.length >= 7;
};

const checkOneYearAnniversary = (createdAt) => {
    const today = new Date();
    const daysPassed = Math.floor((today - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return daysPassed >= 365;
};

// 그룹 목록 조회
router.route('/')
    .get(async (req, res) => {
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

            // 각 그룹에 대한 배지 조건 처리
            const response = {
                currentPage: page,
                totalPages: Math.ceil(totalGroupCount / pageSize),
                totalGroupCount: totalGroupCount,
                data: await Promise.all(groups.map(async (group) => {
                    // 게시물 조회
                    const posts = await Post.find({ groupId: group.id }); // 여러 개의 게시물 조회

                    // 배지 조건 처리
                    const sevenDayPostStreak = checkSevenDayStreak(posts); // 7일 연속 게시물 확인
                    const groupLikesBadge = group.likeCount >= 10;
                    const memoryLikesBadge = posts.some((post) => post.likeCount >= 10);
                    const twentyMemoriesBadge = group.postCount >= 20;
                    const oneYearAnniversaryBadge = checkOneYearAnniversary(group.createdAt);

                    // 배지 목록 관리
                    let badges = group.badges || [];

                    // 배지 추가
                    if (sevenDayPostStreak && !badges.includes('7 Day Post Streak')) {
                        badges.push('7 Day Post Streak');
                    }
                    if (groupLikesBadge && !badges.includes('10+ Group Likes')) {
                        badges.push('10+ Group Likes');
                    }
                    if (memoryLikesBadge && !badges.includes('10+ Memory Likes')) {
                        badges.push('10+ Memory Likes');
                    }
                    if (twentyMemoriesBadge && !badges.includes('20+ Memories')) {
                        badges.push('20+ Memories');
                    }
                    if (oneYearAnniversaryBadge && !badges.includes('1 Year Anniversary')) {
                        badges.push('1 Year Anniversary');
                    }

                    // 배지 삭제 처리
                    badges = badges.filter((badge) => {
                        if (badge === '7 Day Post Streak') {
                            return sevenDayPostStreak;
                        } else if (badge === '10+ Group Likes') {
                            return groupLikesBadge;
                        } else if (badge === '10+ Memory Likes') {
                            return memoryLikesBadge;
                        } else if (badge === '20+ Memories') {
                            return twentyMemoriesBadge;
                        } else if (badge === '1 Year Anniversary') {
                            return oneYearAnniversaryBadge;
                        }
                        return true; // 그 외 배지는 유지
                    });

                    const badgeCount = badges.length; // 배지 카운트

                    // 배지 및 배지 카운트 업데이트
                    await Group.updateOne({
                        id: group.id, // 업데이트 대상 검색
                    }, {
                        badges,
                        badgeCount,
                    });

                    // 업데이트된 그룹 정보 반환
                    return {
                        id: group.id,
                        name: group.name,
                        imageUrl: group.imageUrl,
                        isPublic: group.isPublic,
                        likeCount: group.likeCount,
                        badges, // 배지 추가
                        badgeCount, // 배지 카운트 추가
                        postCount: group.postCount,
                        createdAt: group.createdAt.toISOString(),
                        introduction: group.introduction
                    };
                }))
            };
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
                const sql = `INSERT INTO GroupSalt(id, salt) VALUES (?, ?)`;
                //id는 자동생성 값이므로 group.id로 사용해야함 req.body X
                mysqldb.query(sql, [group.id, salt], (err, rows, fields) => {
                  if (err) {
                    console.log(err);
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
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // 메모리 스토리지 사용
router.route('/:id')
    // 그룹 수정
    .put(upload.single('image'), async (req, res) => {
        try {
            const groupId = req.params.id;
            const group = await Group.findOne({ id: groupId });
            if (!group) {
                return res.status(404).json({ success: false, message: "존재하지 않습니다" });
            }

            const { mysqldb } = await setup();
            const sql = `SELECT salt FROM GroupSalt WHERE id=?`;
            mysqldb.query(sql, [group.id], async (err, rows) => {
                if (err || rows.length === 0) {
                    return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
                }

                try {
                    const salt = rows[0].salt;
                    const hashPw = sha(req.body.password + salt);
                    if (group.password === hashPw) {
                        // AWS S3 설정
                        const s3 = new AWS.S3({
                            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                            region: process.env.AWS_REGION // S3 버킷이 위치한 리전
                        });

                        // 기존 이미지 삭제
                        const imageKey = group.imageUrl.split('/').pop(); // 기존 이미지 키 가져오기
                        const deleteParams = {
                            Bucket: process.env.AWS_S3_BUCKET_NAME,
                            Key: imageKey
                        };

                        await s3.deleteObject(deleteParams).promise(); // 기존 이미지 삭제

                        // 그룹 정보 업데이트
                        await Group.updateOne({ id: groupId }, {
                            name: req.body.name,
                            imageUrl: req.body.imageUrl, // 새로운 URL로 교체
                            isPublic: req.body.isPublic,
                            introduction: req.body.introduction,
                        });

                        const updatedGroup = await Group.findOne({ id: groupId });

                        res.status(200).json({
                            id: updatedGroup.id,
                            name: updatedGroup.name,
                            imageUrl: updatedGroup.imageUrl,
                            isPublic: updatedGroup.isPublic,
                            likeCount: updatedGroup.likeCount,
                            badges: updatedGroup.badges,
                            postCount: updatedGroup.postCount,
                            createdAt: updatedGroup.createdAt.toISOString(),
                            introduction: updatedGroup.introduction
                        });
                        
                    } else {
                        res.status(403).json({ message: "비밀번호가 틀렸습니다" });
                    }
                } catch (err) {
                    console.error(err);
                    res.status(400).json({ message: "잘못된 요청입니다" });
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "서버 오류가 발생했습니다" });
        }
    })



  
    //그룹 삭제
    .delete(async (req, res) => { 
        try {
            const group = await Group.findOne({ id: req.params.id });
            if (!group) {
                return res.status(404).json({ success: false, message: "존재하지 않습니다" });
            }

            // 비밀번호 검증
            const { mysqldb } = await setup();
            const sql = `SELECT salt FROM GroupSalt WHERE id=?`;
            mysqldb.query(sql, [group.id], async (err, rows) => {
                if (err || rows.length === 0) {
                    return res.status(400).json({ success: false, message: "잘못된 요청입니다" });
                }

                try {
                    const salt = rows[0].salt;
                    const hashPw = sha(req.body.password + salt);
                    if (group.password === hashPw) {
                        // AWS S3 설정
                        const s3 = new AWS.S3({
                            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                            region: process.env.AWS_REGION // S3 버킷이 위치한 리전
                        });
                        const imageKey = group.imageUrl.split('/').pop(); // S3의 Key 추출

                        // 그룹 이미지 삭제
                        const deleteParams = {
                            Bucket: process.env.AWS_S3_BUCKET_NAME,
                            Key: imageKey
                        };
                        
                        await s3.deleteObject(deleteParams).promise(); // 비동기 삭제

                        // 그룹에 관련된 게시글 조회 및 삭제
                        const posts = await Post.find({ groupId: req.params.id });
                        for (const post of posts) {
                            if (post.imageUrl) {
                                const postImageKey = post.imageUrl.split('/').pop(); // S3의 Key 추출
                                const postDeleteParams = {
                                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                                    Key: postImageKey
                                };
                                await s3.deleteObject(postDeleteParams).promise(); // 비동기 삭제
                            }
                        }

                        // 그룹 삭제
                        await Group.deleteOne({ id: req.params.id });

                        // 그룹에 관련된 게시글 및 댓글 삭제
                        await Post.deleteMany({ groupId: req.params.id });
                        await Comment.deleteMany({ groupId: req.params.id });

                        // MySQL에서 그룹의 salt 정보 삭제
                        const deleteSaltSql = `DELETE FROM GroupSalt WHERE id = ?`;
                        mysqldb.query(deleteSaltSql, [group.id], (err) => {
                            if (err) {
                                console.error("MySQL salt 삭제 오류:", err);
                            }
                        });
                        res.status(200).json({ message: "그룹 삭제 성공" });
                    } else {
                        res.status(403).json({ message: "비밀번호가 틀렸습니다" });
                    }
                } catch (err) {
                    console.error(err);
                    res.status(400).json({ message: "잘못된 요청입니다" });
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "서버 오류가 발생했습니다" });
        }
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
         const sql = `SELECT salt FROM GroupSalt WHERE id=?`;
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
        const group = await Group.findOne({ id: req.params.id });
        const newlikeCount = group.likeCount+1;
        await Group.updateOne({
           id:req.params.id,//업데이트 대상 검색
        },{
            likeCount : newlikeCount,
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
                    nickname: req.body.nickname,
                    title : req.body.title,
                    content : req.body.content,
                    postPassword: req.body.postPassword,
                    imageUrl: req.body.imageUrl,
                    tags: req.body.tags,
                    location: req.body.location,
                    moment: req.body.moment,
                    isPublic: req.body.isPublic
                });
                
                const sql = `INSERT INTO PostSalt(id, salt, group_id) VALUES (?, ?, ?)`;
                //id는 자동생성 값이므로 post.id로 사용해야함 req.body X
                mysqldb.query(sql, [post.id, salt, post.groupId], (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                  } 
                });
                const group = await Group.findOne({id : req.params.id});
                group.postCount+=1;
                await group.save();
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
        const groupId = req.params.id;
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
            // 응답 보내기
            res.status(200).json(response);

        } catch (err) {
            res.status(400).json({ error: '잘못된 요청입니다' });
        }
    })




module.exports = router;