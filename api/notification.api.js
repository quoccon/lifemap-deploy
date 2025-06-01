// const { messaging } = require("../services/firebase_service");
// const DeviceTokenModel = require('../models/device_token_model');
// const {
//     sendBadRequest,
//     sendCreated,
//     sendServerError,
//     sendSuccess,
//     sendNotFound,
//     sendUnauthorized,
//     sendForbidden
// } = require('../utils/base_response');

// exports.sendNotificationToUser = async (userId, title, body) => {
//     try {
//         const token = await DeviceTokenModel.find({ user: userId }).select('token_fcm');

//         if (!token.length) {
//             return sendBadRequest();
//         }

//         const payload = {
//             notification: {
//                 title: title,
//                 body: body,
//             }
//         }

//         const tokenList = token.map(t => t.token_fcm);
//         const response = await messaging.sendEachForMulticast({
//             tokens: tokenList,
//             ...payload
//         });
//         console.log("Send to user success ",response);
        
//     } catch (error) {
//         console.log("Error send notification: ",error);
        
//     }
// }