const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  // _id 부분은 기본적으로 생략. 알아서 Object.id를 넣어줌
  nickname: {
    type: String, 
    required: true,
    ref: 'Post', // post.js스키마에 reference로 연결되어 있음. join같은 기능. 나중에 populate에 사용
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
  },
});

module.exports = mongoose.model('Comment', commentSchema);
