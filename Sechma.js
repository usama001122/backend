const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
  url: String,
  latitude: Number,
  longitude: Number,
  qrData: String, 
  uploadedAt: Date
});
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },       // Ideally hashed password
  location: { type: String,  },
  images: [imageSchema] ,                     // URL or path to image
  qrcode: { type: String },                         // URL, path, or base64 string
  datetime: { type: Date, default: Date.now }
},
{
  collection: "Userinfo" 
});

module.exports = mongoose.model('Userinfo', userSchema);