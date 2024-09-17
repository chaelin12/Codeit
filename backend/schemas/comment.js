const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  id : {
    type: Number,
    unique: true,
  },
  groupId: { 
    type: Number, 
    required: true,
  },
  postId:{
    type: Number,
    required: true,
  },
  nickname: {
    type: String, 
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  password: {
    type : String,
    required : true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
// 그룹 저장 전에 자동으로 ID를 증가시키는 미들웨어
commentSchema.pre('save', async function (next) {
  const doc = this;

  // ID 증가 로직
  if (doc.isNew) {
    try {
      const highestComment = await mongoose.model('Comment').findOne({}, 'id').sort({ id: -1 }).exec();
      doc.id = highestComment ? highestComment.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
module.exports = mongoose.model('Comment', commentSchema);
