var AuthModel = require("../models/auth.model");
const { check, validationResult } = require('express-validator');
const sendResponse = require('../utils/base_response');
const genarateToken = require('../utils/genarate_token');
var suggetsModel = require('../models/suggest.model');
const suggestModel = require("../models/suggest.model");

exports.register = async (req, res, next) => {
    await Promise.all([
        check('username').notEmpty().withMessage('Username is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        check('gender').isEmpty().withMessage('Gender is required'),
    ])
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, 'Validation failed', errors.array());
    }
    const { username, email, password, avatar, gender, location, sport_preferences } = req.body;
    try {
        const existingUser = await AuthModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return sendResponse(res, 400, 'Username or email already taken');
        }

        const user = new AuthModel({ username, email, password, avatar, gender, location, sport_preferences });
        await user.save();
        return sendResponse(res, 201, 'User registered successfully', user.toJSON);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, `Server error: ${error}`);
    }
};

exports.login = async (req, res, next) => {
    await Promise.all([
        check('email').notEmpty().withMessage('Email is required').run(req),
        check('password').notEmpty().withMessage('Password is required').run(req),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, 'Validation failed', errors.array());
    }
    const { email, password, remember = false } = req.body;
    console.log("remember:", remember);


    try {
        const user = await AuthModel.findOne({ email: email });
        if (!user) {
            return sendResponse(res, 401, 'Invalid credentials');
        }
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return sendResponse(res, 401, 'Invalid credentials');
        }
        const token = genarateToken(user._id, remember);
        console.log(user);

        return sendResponse(res, 200, 'Login successful', { token, user });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server error', "Login failed");
    }
};

exports.infoAccount = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await AuthModel.findById(userId).select('-password');
        if (!user) {
            return sendResponse(res, 404, 'User not found');
        }

        return sendResponse(res, 200, 'Account info retrieved successfully', user);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server error', "Failed to retrieve account info");
    }
};

exports.addSuggets = async (req, res, next) => {
    try {
        const { suggest_name } = req.body;
        const suggest = await suggestModel.findOne({ suggets_name: suggest_name });
        if (suggest) {
            return sendResponse(res, 400, "Suggest already");
        }
        const new_suggest = new suggestModel({
            suggets_name: suggest_name,
        });

        new_suggest.save();
        return sendResponse(res, 200, 'Suggest updated successfully');
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server error', "Failed to retrieve account info");
    }
};

exports.suggestSport = async (req, res, next) => {
    try {
        const suggest = await suggestModel.find();
        if (!suggest) {
            return sendResponse(res, 400, "Not found");
        }
        return sendResponse(res, 200, "Get list suggest successful", suggest);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server error', "Failed to retrieve account info");
    }
};

// exports.updateAccount = async (req, res, next) => {
//     try {
//         const suggestion =
//     } catch (error) {
        
//     }
// }