var db = require('../configs/connect_db');

const mongoose = require('mongoose');
const Schema = db.mongoose;

const event_schema = new Schema({
  event_name: { type: String, required: true, maxlength: 100 },
  sport_type: { type: String, maxlength: 50 },
  location: { type: String, maxlength: 100 },
  organizer: { type: Schema.Types.ObjectId, ref: 'Auth' },
  event_date: { type: Date },
  description: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'Auth' }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', event_schema);