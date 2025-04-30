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
} = require('../utils/base_response');
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
            media_url: imageUrls,
        });

        await post.save();
        return sendSuccess(res, "success");
    } catch (error) {
        console.log("Error: ", error);
        return sendServerError();
    }
};

exports.getPosts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const post = await postModel.find({ user: userId }).populate('user').sort({ created_at: -1 });
        if (!post) {
            return sendResponse(res, 404, "Not Found");
        }
        return sendResponse(res, 200, "success", post);
    } catch (error) {
        console.log("Error: ", error);
        return sendResponse(res, 500, "Server error");
    }
};

exports.addComment = async (req, res, next) => {
    const userId = req.userId;
    const { content, postId } = req.body;
    try {
        const user = await AuthModel.findById(userId).select('-password');
        if (!user) return sendNotFound(res, 'User not found');
        const post = await postModel.findById(postId);
        if (!post) return sendResponse.sendNotFound(res, "Post not found");

        post.comments.push({
            user: userId,
            content: content,
        });

        post.save();
        return sendResponse.sendSuccess(res, 'new post comment success', post);
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error');
    }
}

exports.getComment = async (req, res, next) => {
    const postId = req.query.postId;
    try {
        if (!postId) {
            return sendResponse(res, 400, "Post ID is required");
        }

        const post = await postModel.findById(postId).populate({
            path: 'comments.user', // populate user của comment (nếu bạn để comment là {user, content})
            select: '-password'    // loại bỏ password khi trả user
        });

        if (!post) {
            return sendResponse(res, 404, "Post not found");
        }

        return sendResponse(res, 200, "success", post.comments);
    } catch (error) {
        console.error("Error: ", error);
        return sendResponse(res, 500, "Server error");
    }
};
