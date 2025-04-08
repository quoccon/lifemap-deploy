var db = require('../configs/connect_db');

const post_schema = new db.mongoose.Schema({
    user: { type: db.mongoose.Types.ObjectId, ref: "Auth" },
    content: { type: String },
    media_url: [{ type: String, maxlength: 255 }],
    comments: [
        {
            user: { type: db.mongoose.Types.ObjectId, ref: "Auth" },
            content: { type: String },
            created_at: { type: Date, default: Date.now() },
        },
    ],
    created_at: { type: Date, default: Date.now() },
});

module.exports = db.mongoose.model('Post', post_schema);