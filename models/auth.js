const db = require('../configs/connect_db');
const brypt = require('bcryptjs');

const authSchema = new db.mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    avatar: { type: String, default: '' },
    gender: { type: String, default: '' },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

authSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await brypt.hash(this.password, 10);
    }
    next();
});

authSchema.methods.comparePassword = async function (password) {
    return await brypt.compare(password, this.password);
};

authSchema.set('toJSON',{
    transform:(doc,ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    },
});

module.exports = db.mongoose.model('Auth',authSchema);