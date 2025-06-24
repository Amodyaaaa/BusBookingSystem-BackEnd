const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PassangerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordOTP: {
      type: String,
   },
    resetPasswordOTPExpiry: {
      type: Date,
  },
  role :{
    type:String,
    default:"passanger",
    required:true
}
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Passanger', PassangerSchema);