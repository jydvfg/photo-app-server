const router = require("express").Router();
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const cloudinary = require("../utils/cloudinary");

router.get("/api/posts", (req, res) => {
  const posts = Post.find().then((posts) => {
    res.json(posts);
  });
});

router.get("/posts/users/:userId", (req, res, next) => {
  const { userId } = req.params;
  Post.find({ user: userId })
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/posts/:postId", (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .populate("user")
    .populate({ path: "comments", populate: { path: "user" } })
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/posts", async (req, res, next) => {
  const userId = req.payload._id;
  const { latitude, longitude, title, description, tags, nsfw, postImage } =
    req.body;
  const timestamp = Date.now();

  try {
    const latestPost = await Post.findOne({ user: userId }).sort({
      timestamp: -1,
    });

    if (latestPost) {
      const latestPostTimestamp = new Date(latestPost.timestamp);
      const nextDay = new Date(latestPostTimestamp);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(12, 0, 0, 0);

      if (timestamp < nextDay.getTime()) {
        const deletedPost = await Post.findByIdAndDelete(latestPost._id);
        if (deletedPost) {
          console.log("Previous post deleted successfully");
        } else {
          console.log("Failed to delete previous post");
        }
      }
    }

    if (postImage) {
      const imageInfo = await cloudinary.uploader.upload(postImage, {
        folder: "user-posts",
        allowed_formats: ["jpg", "png", "jpeg"],
        width: 1000,
      });

      const newPost = await Post.create({
        imageUrl: imageInfo.url,
        title,
        description,
        tags,
        nsfw,
        user: userId,
        location: { coordinates: [latitude, longitude] },
        timestamp,
      });

      return res.status(200).json({ newPost });
    } else {
      return res.status(400).json({ message: "Post image is required." });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/posts/:postId", (req, res, next) => {
  const postId = req.params.id;
  Post.findByIdAndUpdate(postId, req.body, { new: true })
    .then((updatedPost) => {
      res.status(200).json(updatedPost);
    })
    .catch((error) => {
      next(error);
    });
});

router.delete("/posts/:postId", (req, res, next) => {
  const postId = req.params.id;
  Post.findByIdAndDelete(postId)
    .then((result) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send({ error: failed });
    });
});

module.exports = router;
