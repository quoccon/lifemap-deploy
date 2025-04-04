const { default: mongoose } = require('mongoose');
var db = require('../configs/connect_db');

const achievements_chema = new db.mongoose.Schema({
    sport_type:{type:String},
    distance:{type:Number, min:0},
    duration:{type:Number,min:0},
    recorded_at:{type:Date,default:Date.now()},
    user:{type: db.mongoose.Types.ObjectId, ref:"Auth"}
});

module.exports = mongoose.model('Achievements',achievements_chema);