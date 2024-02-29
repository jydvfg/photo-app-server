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
  const postId = req.params.id;
  Post.findById(postId)
    .populate("comments")
    .then((post) => {
      res.status(200).json(post);
    })
    .next((error) => {
      next(error);
    });
});

router.post("/posts", (req, res, next) => {
  const userId = req.payload._id;
  const { latitude, longitude } = req.body;
  const timestamp = Date.now();
  const { title, description, tags, nsfw } = req.body;

  const { postImage } = req.body;
  console.log(
    "I am here and working !!!",
    userId,
    latitude,
    longitude,
    title,
    description,
    tags,
    nsfw
  );
  console.log("Profile image current received from req.body =>", postImage);

  if (postImage) {
    cloudinary.uploader
      .upload(postImage, {
        folder: "user-posts",
        allowed_formats: ["jpg", "png", "jpeg"],
        width: 1000,
      })
      .then((imageInfo) => {
        Post.create({
          imageUrl: imageInfo.url,
          title,
          description,
          tags,
          nsfw,
          user: userId,
          location: { coordinates: [latitude, longitude] },
          timestamp,
        })
          .then((newPost) => {
            res.status(200).json({ newPost });
          })
          .catch((error) => {
            next(error);
          });
      })
      .catch(() => {
        res.status(500).json({
          errorMesage:
            "Error occured while you are trying to upload image to cloudinary!",
        });
      });
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
