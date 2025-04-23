var db = require('../configs/connect_db');

const province_schema = new db.mongoose.Schema({
    code: String,
    name: String,
});

module.exports = mongoose.model('Province', province_schema);