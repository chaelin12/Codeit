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

module.exports = mongoose.model('Post', postSchema);