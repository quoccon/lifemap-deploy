const jwt = require('jsonwebtoken');
require('dotenv').config();

const genarateToken = (userId,remember) => {
    const expiresIn = remember ? '7d' : '1h';
    return jwt.sign({userId}, process.env.JWT_SECRET,{expiresIn: expiresIn});
};

module.exports = genarateToken;