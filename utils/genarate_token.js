const jwt = require('jsonwebtoken');
require('dotenv').config();

const genarateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET,{expiresIn: "7d"});
};

module.exports = genarateToken;