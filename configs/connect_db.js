const mongoose = require('mongoose');
require('dotenv').config();
const DBURL = process.env.DBURl;

mongoose.connect(DBURL).then(() => {
    console.log("Connect mongoose successfully");
}).catch((error) => {
    console.log("Connect mongoose failed: " + error);
});

module.exports = { mongoose };