const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");

router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find().populate("user", "username");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/comments", async (req, res) => {
  try {
    const comment = await Comment.create({
      comment: req.body.comment,
      user: req.body.userId,
    });

    const postId = req.body.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/comments/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
