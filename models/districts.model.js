var db = require('../configs/connect_db');

const districts_schema = new db.mongoose.Schema({
    code: String,
    name: String,
    parent_code: String,
});

module.exports = mongoose.model('District', districts_schema);