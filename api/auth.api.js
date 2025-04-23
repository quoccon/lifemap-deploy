const AuthModel = require("../models/auth.model");
const { check, validationResult } = require('express-validator');
const {
    sendBadRequest,
    sendCreated,
    sendServerError,
    sendSuccess,
    sendNotFound,
    sendUnauthorized
} = require('../utils/base_response');
const generateToken = require('../utils/genarate_token');
const SuggestModel = require('../models/suggest.model');
const { generateOTP, getOTPExpiration, sendOTP } = require('../utils/genarate_otp');

exports.register = async (req, res) => {
    await Promise.all([
        check('username').notEmpty().withMessage('Username is required').run(req),
        check('email').isEmail().withMessage('Invalid email').run(req),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req),
        check('gender').notEmpty().withMessage('Gender is required').run(req),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendBadRequest(res, 'Validation failed', errors.array());
    }

    const { username, email, password, avatar, gender, location, sport_preferences } = req.body;
    try {
        const existingUser = await AuthModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return sendBadRequest(res, 'Username or email already taken');
        }

        const otp = generateOTP();
        const otpExpires = getOTPExpiration();

        const user = new AuthModel({
            username, email, password, avatar, gender, location,
            sport_preferences, otp, otpExpires
        });

        await user.save();
        await sendOTP(email, otp);

        return sendCreated(res, 'User registered successfully', user.toJSON());
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Server error during registration');
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await AuthModel.findOne({ email });
        if (!user) return sendNotFound(res, 'User not found');

        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return sendBadRequest(res, 'OTP code is invalid or expired');
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerifyToken = true;
        await user.save();

        return sendSuccess(res, 'Account verification successful', user.toJSON());
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Verify OTP failed');
    }
};

exports.login = async (req, res) => {
    await Promise.all([
        check('email').notEmpty().withMessage('Email is required').run(req),
        check('password').notEmpty().withMessage('Password is required').run(req),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendBadRequest(res, 'Validation failed', errors.array());
    }

    const { email, password, remember = false } = req.body;
    try {
        const user = await AuthModel.findOne({ email }).populate('sport_preferences');
        if (!user) return sendUnauthorized(res, 'Invalid credentials');

        const isValid = await user.comparePassword(password);
        if (!isValid) return sendUnauthorized(res, 'Invalid credentials');

        const token = generateToken(user._id, remember);
        return sendSuccess(res, 'Login successful', { token, user });
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Login failed');
    }
};

exports.infoAccount = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await AuthModel.findById(userId).select('-password');
        if (!user) return sendNotFound(res, 'User not found');

        return sendSuccess(res, 'Account info retrieved successfully', user);
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve account info');
    }
};

exports.addSuggets = async (req, res) => {
    try {
        const { suggest_name } = req.body;
        const existing = await SuggestModel.findOne({ suggets_name: suggest_name });
        if (existing) return sendBadRequest(res, 'Suggest already exists');

        const newSuggest = new SuggestModel({ suggets_name: suggest_name });
        await newSuggest.save();

        return sendSuccess(res, 'Suggest added successfully');
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to add suggest');
    }
};

exports.suggestSport = async (req, res) => {
    try {
        const suggestions = await SuggestModel.find();
        if (!suggestions || suggestions.length === 0) {
            return sendNotFound(res, 'No suggestions found');
        }
        return sendSuccess(res, 'Get list suggest successful', suggestions);
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve suggestions');
    }
};
