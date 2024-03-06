const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cloudinary = require("../utils/cloudinary");
const router = express.Router();
const saltRounds = 10;

router.get("/signup", (req, res) => res.send("Route is working !"));

router.post("/signup", async (req, res) => {
  const { email, password, name, username, image, isPublic, about, isAdmin } =
    req.body;

  if (email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, password, and name" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  try {
    if (image) {
      const imageInfo = await cloudinary.uploader.upload(image, {
        folder: "user-profile",
        allowed_formats: ["jpg", "png", "jpeg"],
        height: 300,
      });

      const imageUrl = imageInfo.secure_url;

      const foundUser = await User.findOne({ email });
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const createdUser = await User.create({
        email,
        password: hashedPassword,
        name,
        username,
        image: imageUrl,
        isPublic,
        about,
        isAdmin,
      });

      const { _id } = createdUser;

      const user = {
        email,
        name,
        _id,
        username,
        image: imageUrl,
        isPublic,
        about,
        isAdmin,
      };

      res.status(201).json({ user });
    } else {
      res.status(400).json({ message: "Provide an image" });
    }
  } catch (err) {
    console.log("Error =", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/users/:username/password", isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase, and one uppercase letter.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name, username } = foundUser;

        const payload = { _id, email, name, username };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  User.findById(req.payload._id)
    .then((user) => {
      if (user) {
        res.status(200).json(req.payload);
      }
    })
    .catch((error) => {
      console.log("Error =>", error);
    });
});

module.exports = router;
