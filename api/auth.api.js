var AuthModel = require("../models/auth");
const { check, validationResult } = require('express-validator');
const sendResponse = require('../utils/base_response');
exports.register = async (req, res, next) => {
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ]
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, 'Validation failed', errors.array());
    }
    const { username, email, password, avatar, gender } = req.body;
    try {
        const existingUser = await AuthModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return sendResponse(res, 400, 'Username or email already taken');
        }

        const user = new AuthModel({ username, email, password, avatar, gender });
        await user.save();
        return sendResponse(res, 201, 'User registered successfully', user);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, `Server error: ${error}`);
    }
};