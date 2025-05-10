var db = require('../configs/connect_db');

const challenge_schema = new db.mongoose.Schema({
    challenge_name: { type: String, required: true, maxlength: 100 },
    sport_type: { type: String, maxlength: 50 },
    goal: { type: String, maxlength: 100 },
    duration_days: { type: Number, min: 1 },
    created_by: { type: db.mongoose.Types.ObjectId, ref: "Auth" },
    start_date: { type: Date },
    end_date: { type: Date },
    created_at: { type: Date, default: Date.now() },
    status: { type: Number, default: 0 },
    image_challenge: { type: String },
    daily_start_time: { type: String, },
    participants: [
        {
            user: { type: db.mongoose.Types.ObjectId, ref: "Auth" },
            progress: { type: Number, default: 0 },
            status: { type: Number, default: 1 },
            joined_at: { type: Date, default: Date.now() }
        }
    ]
});

module.exports = db.mongoose.model('Challenge', challenge_schema);