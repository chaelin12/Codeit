const mongoose=require('mongoose');
const { Schema } =mongoose;

const postSchema = new Schema({
    id: { type: Number, unique: true },
    groupId: { type: Number, required: true, ref: 'Group' },
    nickname: { type: String, required: true },
    postPassword: {type: String,required: true},
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: false },
    tags: { type: [String], default: [] },
    location: { type: String, required: false },
    moment: { type: String, required: true },
    isPublic: { type: Boolean, required: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
// 그룹 저장 전에 자동으로 ID를 증가시키는 미들웨어
postSchema.pre('save', async function (next) {
    const doc = this;
  
    // ID 증가 로직
    if (doc.isNew) {
      try {
        const highestGroup = await mongoose.model('Post').findOne({}, 'id').sort({ id: -1 }).exec();
        doc.id = highestPost ? highestPost.id + 1 : 1;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });
module.exports = mongoose.model('Post', postSchema);