const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

const User = require("../models/authentication/userModel");
const Post = require("../models/frontend/postModel");
const Message = require("../models/frontend/messageSchema");
const path = require("path");
const imagekit = require("../utils/imagekit").initImageKit();
const { v4: uuidv4 } = require("uuid");
const { read } = require("fs");

// accounts start

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.id)
      .populate("matched")
      .populate("chatList")
      .populate("posts")
      .exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(user.matched.length);
    res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.usersignout = catchAsyncErrors(async (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");

    // Respond with a JSON success message
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully." });
  } catch (error) {
    console.error(error);

    // If an error occurs, respond with a JSON error message
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

exports.createPost = catchAsyncErrors(async (req, res, next) => {
  try {
    const { postImg, postData, caption, feeling } = req.body;
    const userId = req.id;

    const postEvent = new Post(postData);

    // Check if post image file exists in the request
    if (req.files && req.files.postImg) {
      const postImgFile = req.files.postImg;
      const modifiedProfileFileName = `postImg-${Date.now()}${path.extname(
        postImgFile.name
      )}`;

      // Upload post image to ImageKit
      const { fileId, url } = await imagekit.upload({
        file: postImgFile.data,
        fileName: modifiedProfileFileName,
      });

      postEvent.postImg = {
        fileId: fileId, // Store the fileId of the uploaded image
        url: url, // Store the URL of the uploaded image
      };
    }

    // Create new post data
    const newPost = new Post({
      caption: caption,
      feeling: feeling,
      user: userId,
      postImg: postEvent.postImg,
    });

    // Save the new post
    await newPost.save();

    // Update User's posts array with newPost's ID
    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

    // Send response with success message
    res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.allPost = catchAsyncErrors(async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate({ path: "user", populate: { path: "matched" } })
      .populate({ path: "likes" })
      .populate({
        path: "comments",
        populate: [{ path: "user" }, { path: "commentslikes" }],
      })
      .populate({
        path: "comments.commentsComment",
        populate: [{ path: "user" }, { path: "likes" }],
      })
      .exec();

    if (!posts) {
      return res.status(404).json({ error: "Posts not found" });
    }

    // Extract matched users for each post
    const matchedUsers = posts.map((post) => ({
      postId: post._id,
      matchedUsers: post.user.matched.map((match) => match._id),
    }));

    res.json({ posts, matchedUsers });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.postLike = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.id).exec();
    const postId = req.params.id;

    const post = await Post.findById(postId).exec();
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const alreadyLiked = post.likes.some((like) =>
      like.equals(currentUser._id)
    );
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ error: "You have already liked this post." });
    }

    post.likes.push(currentUser._id);

    await post.save();

    // If the like operation is successful, send a success response
    return res.status(200).json({ message: "Post liked successfully." });
  } catch (error) {
    console.error(error);
    // If an error occurs during the like operation, send an error response
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.commentPost = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const currentUserId = req.id;

    // Check if the post exists
    const postId = req.params.id;
    const post = await Post.findById(postId).exec();
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Extract comment from request body
    const comment = req.body.comment;
    if (!comment) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    // Add comment to the post
    post.comments.push({ user: currentUserId, text: comment });
    await post.save();

    // If the comment operation is successful, send a success response
    return res.status(200).json({ message: "Comment posted successfully." });
  } catch (error) {
    console.error(error);
    // If an error occurs during the comment operation, send an error response
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.commentLike = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.id).exec();
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const post = await Post.findById(postId).exec();
    console.log(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const comment = post.comments.find((comment) =>
      comment._id.equals(commentId)
    );
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    const alreadyLiked = comment.commentslikes.some((like) =>
      like.equals(currentUser._id)
    );
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ error: "You have already liked this comment." });
    }

    comment.commentslikes.push(currentUser._id);

    await post.save();

    // If the like operation is successful, send a success response
    return res.status(200).json({ message: "Comment liked successfully." });
  } catch (error) {
    console.error(error);
    // If an error occurs during the like operation, send an error response
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.commentCommnet = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const currentUserId = req.id;

    const postId = req.params.postId;
    const post = await Post.findOne({ _id: postId }).exec();
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const parentCommentId = req.params.parentCommentId;
    const comment = req.body.comment;

    const parentComment = post.comments.id(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found." });
    }

    parentComment.commentsComment.push({ user: currentUserId, text: comment });

    await post.save();

    return res.status(200).json({ message: "Comment posted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.commentsCommLike = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.id).exec();
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const nestedCommentId = req.params.nestedCommentId;

    const post = await Post.findById(postId).exec();
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const comment = post.comments.find((comment) =>
      comment._id.equals(commentId)
    );
    if (!comment) {
      return res.status(404).json({ error: "Main comment not found." });
    }

    const nestedComment = comment.commentsComment.find((comment) =>
      comment._id.equals(nestedCommentId)
    );
    if (!nestedComment) {
      return res.status(404).json({ error: "Nested comment not found." });
    }

    const alreadyLiked = nestedComment.likes.some((like) =>
      like.equals(currentUser._id)
    );
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ error: "You have already liked this nested comment." });
    }

    nestedComment.likes.push(currentUser._id);
    await post.save();

    return res
      .status(200)
      .json({ message: "Nested comment liked successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.feelingmatch = catchAsyncErrors(async (req, res, next) => {
  let userFeeling = req.body.feeling;

  if (!userFeeling) {
    return res.status(400).json({ error: "Feeling not provided" });
  }

  try {
    let user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.feeling = userFeeling;
    await user.save();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

exports.feelingShare = catchAsyncErrors(async (req, res, next) => {
  if (!req.id) {
    return res
      .status(401)
      .json({ success: false, message: "User not logged in" });
  }
  const otherUserId = req.id;
  const currentUser = req.params.id;

  try {
    const otherUser = await User.findById(otherUserId);
    if (!otherUser.matched.includes(currentUser)) {
      otherUser.matched.push(currentUser);
      await otherUser.save();
    }
    return res
      .status(200)
      .json({ success: true, message: "User matched successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

exports.addInChat = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentUserId = req.id; // Assuming req.id is the current user's ID
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found." });
    }

    const userId = req.params.id;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const alreadyChat = currentUser.chatList.some((chat) =>
      chat.equals(user._id)
    );
    if (alreadyChat) {
      return res
        .status(400)
        .json({ error: "You have already chatted with this user." });
    }

    currentUser.chatList.push(user._id);

    await currentUser.save();

    // If the operation is successful, send a success response
    return res
      .status(200)
      .json({ message: "User added to chat successfully." });
  } catch (error) {
    console.error(error);
    // If an error occurs, send an error response
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.addInChat = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentUserId = req.id; // Assuming req.id is the current user's ID
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found." });
    }

    const userId = req.params.id;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const alreadyChat = currentUser.chatList.some((chat) =>
      chat.equals(user._id)
    );
    if (alreadyChat) {
      return res
        .status(400)
        .json({ error: "You have already chatted with this user." });
    }

    currentUser.chatList.push(user._id);

    await currentUser.save();

    // If the operation is successful, send a success response
    return res
      .status(200)
      .json({ message: "User added to chat successfully." });
  } catch (error) {
    console.error(error);
    // If an error occurs, send an error response
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { sender, receiver, message } = req.body;

    // Save message to database
    const newMessage = await Message.create({ sender, receiver, message });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});




exports.getChatHistory = catchAsyncErrors(async (req, res, next) => {
  try {
    const results = await Message.find(req.id).exec();
    console.log(results);
  } catch (error) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message,
    });
  }
});


// order process end

// accounts end
