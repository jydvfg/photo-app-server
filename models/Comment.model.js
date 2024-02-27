const { Schema, model, default: mongoose } = require("mongoose");

const commentSchema = new Schema({
  comment: {
    required: true,
    type: String,
    maxLength: 100,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  user: { type: mongoose.Schema.Type.ObjectId, ref: "User" },
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;
