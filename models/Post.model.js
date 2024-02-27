const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  img: String, //URL
  title: { type: String, maxLength: 20 },
  description: { type: String, maxLength: 100 },
  tags: {
    type: [
      {
        type: String,
        enum: [
          "street",
          "portrait",
          "B&W",
          "adult",
          "architecture",
          "film",
          "digital",
          "lo-fi",
          "post-photography",
          "astro",
          "wildlife",
          "documentary",
          "sports",
          "macro",
          "landscape",
          "absrtract",
          "event",
          "nature",
          "conceptual",
          "studio",
          "candid",
          "vernacular",
          "fine-art",
          "composite",
          "night",
          "fashion",
        ],
      },
    ],
    validate: {
      validator: function (tags) {
        return tags.length <= 5;
      },
      message: "Cannot have more than 5 tags",
    },
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [<longitude>, <latitude>]
      index: "2dsphere", //geospatioal index
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Post = model("Post", postSchema);

module.exports = Post;