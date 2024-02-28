const { Schema, model, default: mongoose } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
      maxLength: 10,
    },
    image: {
      type: String,
      default: "https://i.imgur.com/r8bo8u7.png",
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    about: { type: String, maxlength: 150 },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
