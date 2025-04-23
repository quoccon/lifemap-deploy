var db = require('../configs/connect_db');

const ward_schema = new db.mongoose.Schema({
    code: String,
    name: String,
    parent_code: String
});

module.exports = mongoose.model('District', ward_schema);