const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema({
    id : {type : Number, unique : true},
    name: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    isPublic: { type: Boolean, required: true, default: true }, // 기본값을 true로 설정
    introduction: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    badges: { type: [String], default: [] }, 
    badgeCount: { type: Number, default: 0 }, // badgeCount 추가, 자동 계산됨
    postCount: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now }, 
});

// badges가 변경될 때마다 badgeCount를 업데이트
groupSchema.pre('save', function(next) {
    this.badgeCount = this.badges.length;
    next();
});
// 그룹 저장 전에 자동으로 ID를 증가시키는 미들웨어
groupSchema.pre('save', async function (next) {
    const doc = this;
  
    // ID 증가 로직
    if (doc.isNew) {
      try {
        const highestGroup = await mongoose.model('Group').findOne({}, 'id').sort({ id: -1 }).exec();
        doc.id = highestGroup ? highestGroup.id + 1 : 1;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });

module.exports = mongoose.model('Group', groupSchema);
