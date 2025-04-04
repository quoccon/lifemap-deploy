const db = require('../configs/connect_db');
const brypt = require('bcryptjs');

const auth_schema = new db.mongoose.Schema({
    username: { type: String, unique: true, required: true ,maxlength:50},
    email: { type: String, unique: true, required: true ,maxlength:100},
    avatar: { type: String, default: '' },
    gender: { type: String, default: '' },
    password: { type: String, required: true },
    isVerifyToken:{ type: Boolean, default: false},
    otp:{type: String},
    otpExpires: { type: Number },
    location:{type: String},
    sport_preferences:[{type:String}],
    password: { type: String, required: true ,maxlength:100},
    created_at: { type: Date, default: Date.now },
});

auth_schema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await brypt.hash(this.password, 10);
    }
    next();
});

auth_schema.methods.comparePassword = async function (password) {
    return await brypt.compare(password, this.password);
};

auth_schema.set('toJSON',{
    transform:(doc,ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    },
});

module.exports = db.mongoose.model('Auth',auth_schema);