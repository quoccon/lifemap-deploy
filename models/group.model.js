var db = require('../configs/connect_db');

const group_schema = new db.mongoose.Schema({
    group_name: { type: String, maxlength: 50 },
    sport_type: { type: String },
    location: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now() },
    creator: { type: db.mongoose.Types.ObjectId, ref: 'Auth' },
    members: [{ type: db.mongoose.Types.ObjectId, ref: "Auth" }]
});

module.exports = db.mongoose.model('Group', group_schema);