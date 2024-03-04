const { Schema, model, default: mongoose } = require("mongoose");

const commentSchema = new Schema({
  comment: {
    required: true,
    type: String,
    maxLength: 100,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;
