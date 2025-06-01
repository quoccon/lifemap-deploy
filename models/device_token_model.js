const db = require('../configs/connect_db');

const device_token_schema = new db.mongoose.Schema({
    user: { type: db.mongoose.Types.ObjectId, ref: "Auth" },
    token_fcm: { type: String },
    // device_info: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

device_token_schema.index({ token_fcm: 1 }, { unique: true });
device_token_schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = db.mongoose.model('DeviceToken', device_token_schema);