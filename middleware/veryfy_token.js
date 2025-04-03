const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/base_response');
require('dotenv').config();

const veryfyToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return sendResponse(res,401,"No token provided");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        
        req.userId = decoded.userId;
        console.log(req.userId);
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return sendResponse(res, 401, 'Invalid token');
    }
}

module.exports = veryfyToken;