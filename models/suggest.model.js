var db = require('../configs/connect_db');

const suggest_schema = new db.mongoose.Schema({
    suggets_name: { type: String },
},{ versionKey: false });

module.exports = db.mongoose.model('Suuggest',suggest_schema);