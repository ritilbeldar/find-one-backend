const express = require("express");
const router = express.Router();

const {
    usersignout,
    currentUser,
    createPost,
    allPost,
    postLike,
    commentPost,
    commentLike,
    commentCommnet,
    commentsCommLike,
    addInChat,
    sendMessage,
    getChatHistory,


    feelingmatch,
    feelingShare,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middlewares/user_auth");

// User Start

router.get("/", isAuthenticated, currentUser);

router.get("/signout", isAuthenticated, usersignout);

router.post("/post_create", isAuthenticated, createPost);

router.get("/all_post", isAuthenticated, allPost);

router.post("/post_like/:id", isAuthenticated, postLike);


router.post("/post_commnet/:id", isAuthenticated, commentPost);

router.post("/post_commnet_like/:postId/:commentId", isAuthenticated, commentLike);

router.post("/post_commnet_comment/:postId/:parentCommentId", isAuthenticated, commentCommnet);

router.post("/post_commnet_comment_like/:postId/:commentId/:nestedCommentId", isAuthenticated, commentsCommLike);






router.post("/feelingmatch", isAuthenticated, feelingmatch);

router.get("/feeling_Share/:id", isAuthenticated, feelingShare);



router.post("/add_in_chat/:id", isAuthenticated, addInChat);


router.post("/send_message",  sendMessage);

router.get("/chat_history/:userId",  getChatHistory);


// User end

module.exports = router;
