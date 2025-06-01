const DeviceToken = require('../models/device_token_model');
const AuthModel = require('../models/auth.model');
const { sendSuccess, sendNotFound, sendServerError } = require('../utils/base_response');

exports.addDeviceToken = async (req, res, next) => {
    const userId = req.userId;
    const { token_fcm } = req.body;
    try {
        const user = await AuthModel.findById(userId).select('-password');
        if (!user) return sendNotFound(res, 404);

        const device_token = new DeviceToken({
            user: userId,
            token_fcm,
        });

        await device_token.save();
        return sendSuccess(res,200)
    } catch (error) {
        console.log("Error service: ", error);
        return sendServerError(res,500);
    }
}