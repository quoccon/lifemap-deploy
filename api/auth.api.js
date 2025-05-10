const AuthModel = require("../models/auth.model");
const { check, validationResult } = require('express-validator');
const {
    sendBadRequest,
    sendCreated,
    sendServerError,
    sendSuccess,
    sendNotFound,
    sendUnauthorized,
    sendForbidden
} = require('../utils/base_response');
const generateToken = require('../utils/genarate_token');
const SuggestModel = require('../models/suggest.model');
const { generateOTP, getOTPExpiration, sendOTP } = require('../utils/genarate_otp');
const { uploadImage } = require('../utils/upload_file_to_firebase');
// const upload = require('../utils/upload');
const path = require('path');
const PROVINCES_FILE = path.join(__dirname, '../data/tinh_tp.json');
const DISTRICTS_FILE = path.join(__dirname, '../data/quan_huyen.json');
const WARDS_FILE = path.join(__dirname, '../data/xa_phuong.json');
const readJsonFile = require('../utils/import_location_data');

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

    const { username, email, password, gender } = req.body;
    try {
        const existingUser = await AuthModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return sendBadRequest(res, 'Username or email already taken');
        }

        const otp = generateOTP();
        const otpExpires = getOTPExpiration();

        const user = new AuthModel({
            username, email, password, gender, otpExpires, otp
        });

        await user.save();
        await sendOTP(email, otp);

        return sendCreated(res, 'User registered successfully');
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
        console.log(user.otp !== otp || Date.now() > user.otpExpires);

        console.log(user.otp);
        console.log(otp);
        console.log(Date.now());

        console.log(user.otpExpires);


        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return sendBadRequest(res, 'OTP code is invalid or expired');
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerifyToken = true;
        await user.save();

        return sendSuccess(res, 'Account verification successful');
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
        return sendSuccess(res, 'Login successful', {
            token: {
                type: 'Bearer',
                token: token,
            }, user
        });
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

exports.updateUser = async (req, res, next) => {
    const userId = req.userId;
    const { sport_preferences, city, district, ward, address } = req.body;
    const file = req.file;
    try {
        const user = await AuthModel.findById(userId).select('-password');
        if (!user) return sendNotFound(res, 'User not found');

        if (file) {
            try {
                const avatarUrl = await uploadImage(file);
                user.avatar = avatarUrl;
            } catch (error) {
                console.error('Avatar upload error:', uploadError);
                return sendServerError(res, 'Failed to upload avatar');
            }
        }

        if (sport_preferences) {
            user.sport_preferences = sport_preferences;
        }
        if (city && district && ward && address) {
            user.location.city = city;
            user.location.district = district;
            user.location.ward = ward;
            user.location.address = address;
        }

        await user.save();
        return sendSuccess(res, 'Update user successfully', user);
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve suggestions');
    }
}

exports.getProvinces = async (req, res) => {
    try {
        const provinces = await readJsonFile(PROVINCES_FILE);
        return sendSuccess(res, 'get provinces success', provinces);
    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve suggestions');
    }
}

exports.getDistricts = async (req, res) => {
    const provinceId = req.query.province_id;
    if (!provinceId) {
        return sendBadRequest(res, 'province_id is required');
    }
    try {
        const districtsRaw = await readJsonFile(DISTRICTS_FILE);
        const districts = Object.values(districtsRaw)
        const filteredDistricts = districts.filter(d => {
            return String(d.parent_code) === String(provinceId);
        });

        return sendSuccess(res, 'get districts success', filteredDistricts);

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve suggestions');
    }
}

exports.getWards = async (req, res) => {
    const districtId = req.query.district_id;
    if (!districtId) {
        return sendBadRequest(res, 'distrcts is required');
    }
    try {
        const wardsRaw = await readJsonFile(WARDS_FILE);
        const wards = Object.values(wardsRaw);
        const filterWards = wards.filter(w => String(w.parent_code) === String(districtId));
        return sendSuccess(res, 'get wards success', filterWards);

    } catch (error) {
        console.error(error);
        return sendServerError(res, 'Failed to retrieve suggestions');
    }
}

exports.requestFollow = async (req, res, next) => { 
    
    try {
        
    } catch (error) {
        
    }
};