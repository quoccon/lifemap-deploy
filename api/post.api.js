var postModel = require('../models/post.model');
var { uploadImage } = require('../utils/upload_file_to_firebase');
var sendResponse = require('../utils/base_response');

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
        return sendResponse(res, 200, "success");
    } catch (error) {
        console.log("Error: ", error);
        return sendResponse(res, 500, "Server error");
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