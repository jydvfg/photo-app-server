const router = require("express").Router();
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

router.get("api/users", (req, res) => {
  res.json(users);
});

router.get("/users", (req, res, next) => {
  User.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/users/:username", (req, res, next) => {
  const username = req.params.username;
  const loggedInUserId = req.payload._id;

  User.findOne({ username })
    .populate("savedPosts")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user._id.toString() === loggedInUserId) {
        res.status(200).json(user);
      } else {
        res.status(200).json({
          _id: user._id,
          name: user.name,
          image: user.image,
          about: user.about,
          email: user.email,
          isPublic: user.isPublic,
          savedPosts: user.savedPosts,
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.put("/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  const postId = req.body.postId;

  User.findByIdAndUpdate(
    userId,
    { $push: { savedPosts: postId } },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updatedUser);
    })
    .catch((error) => {
      next(error);
    });
});

router.delete("/users/:userId", (req, res) => {
  const userId = req.payload._id;
  User.findByIdAndDelete(userId)
    .then((result) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send({ error: failed });
    });
});

module.exports = router;
