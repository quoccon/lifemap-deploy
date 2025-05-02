var postModel = require('../models/post.model');
var { uploadImage } = require('../utils/upload_file_to_firebase');
const {
    sendBadRequest,
    sendCreated,
    sendServerError,
    sendSuccess,
    sendNotFound,
    sendUnauthorized,
    sendForbidden
} = require('../utils/base_response'); // Updated to use responseHelper

exports.createNewPost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { content } = req.body;

        let imageUrls = [];

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadImage(file));
            imageUrls = await Promise.all(uploadPromises);
        }

        console.log("image: ", imageUrls);

        const post = new postModel({
            user: userId,
            content,
            media_url: process.env.REACT_APP_API_URL + imageUrls,
        });

        await post.save();
        return sendCreated(res, "Post created successfully", post);
    } catch (error) {
        console.log("Error: ", error);
        return sendServerError(res, "Internal server error");
    }
};

exports.getPosts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const posts = await postModel.find({ user: userId })
            .populate('user', '-password')
            .sort({ created_at: -1 });

        if (!posts || posts.length === 0) {
            return sendNotFound(res, "No posts found");
        }

        return sendSuccess(res, "Posts retrieved successfully", posts);
    } catch (error) {
        console.log("Error: ", error);
        return sendServerError(res, "Internal server error");
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { content, postId } = req.body;

        if (!content || !postId) {
            return sendBadRequest(res, "Content and postId are required");
        }

        const post = await postModel.findById(postId);
        if (!post) {
            return sendNotFound(res, "Post not found");
        }

        post.comments.push({
            user: userId,
            content: content,
        });

        await post.save();
        const updatedPost = await postModel.findById(postId).populate('comments.user', '-password');
        return sendCreated(res, "Comment added successfully", updatedPost);
    } catch (error) {
        console.error("Error: ", error);
        return sendServerError(res, "Internal server error");
    }
};

exports.getComment = async (req, res, next) => {
    try {
        const postId = req.query.postId;

        if (!postId) {
            return sendBadRequest(res, "Post ID is required");
        }

        const post = await postModel.findById(postId).populate({
            path: 'comments.user',
            select: '-password'
        });

        if (!post) {
            return sendNotFound(res, "Post not found");
        }

        return sendSuccess(res, "Comments retrieved successfully", post.comments);
    } catch (error) {
        console.error("Error: ", error);
        return sendServerError(res, "Internal server error");
    }
};