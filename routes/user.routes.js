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

router.get("/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  const loggedInUserId = req.payload._id;
  if (userId === loggedInUserId) {
    User.findById(loggedInUserId)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        next(error);
      });
  } else {
    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.put("/users/:userId", (req, res, next) => {
  const userId = req.payload._id;
  User.findByIdAndUpdate(userId, req.body, { new: true })
    .then((updatedUser) => {
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
