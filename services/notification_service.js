const DeviceModel = require('../models/device_token_model');
const { messaging } = require('./firebase_service');

async function sendNotificationToUser(userId, title, body) {
    try {
        // Lấy token FCM của người dùng
        const tokenData = await DeviceModel.findOne({ user: userId }).select('token_fcm');
        console.log('token: ',tokenData);
        
        if (!tokenData || !tokenData.token_fcm) {
            console.log('Không tìm thấy token FCM cho người dùng.');
            return;
        }

        const message = {
            token: tokenData.token_fcm,
            notification: {
                title,
                body
            },
            // Thêm thuộc tính android và apns để xử lý lỗi SenderId mismatch
            android: {
                priority: 'high'
            },
            apns: {
                headers: {
                    'apns-priority': '10'
                }
            }
        };

        const response = await messaging.send(message);
        console.log('Gửi thông báo thành công: ', response);
    } catch (error) {
         console.log('Lỗi khi gửi thông báo: ', error);
        // Kiểm tra chi tiết lỗi để xác định vấn đề
        if (error.code === 'messaging/sender-id-mismatch') {
            console.log('Lỗi do không khớp SenderId. Vui lòng kiểm tra cấu hình Firebase.');
        }
        throw error;
    }
}

module.exports = {
    sendNotificationToUser
};
