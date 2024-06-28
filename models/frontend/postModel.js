const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    feeling: {
      type: String,
    },
    caption: {
      type: String,
      default: "",
    },
    postImg: {
      fileId: { type: String, default: null },
      url: { type: String, default: "" },
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        text: String,
        commentslikes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],
        createdAt: { type: Date, default: Date.now },
        commentsComment: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "user",
            },
            text: String,
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
              },
            ],
            createdAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
