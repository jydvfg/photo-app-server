const router = require("express").Router();
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const fileUploader = require("../config/cloudinary.config");

router.get("/api/posts", (req, res) => {
  res.json(posts);
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

router.post("/posts", fileUploader.single("imageUrl"), (req, res, next) => {
  const userId = req.payload._id;

  // Assuming you have middleware that adds location information to the request object
  const { latitude, longitude } = req.location; // Get the latitude and longitude

  const timestamp = Date.now();

  const { title, description, tags, nsfw } = req.body;
  const imageUrl = req.file.path;

  Post.create({
    img: imageUrl,
    title,
    description,
    tags,
    nsfw,
    user: userId,
    location: { coordinates: [longitude, latitude] },
    timestamp,
  })
    .then((newPost) => {
      res.status(201).json({ newPost });
    })
    .catch((error) => {
      next(error);
    });
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
