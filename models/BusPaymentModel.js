const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusPaymentSchema = new Schema(
    {
    busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
    },
    AcNo: {
        type: String,
        required: false,
    },
    bankname: {
        type: String,
        required: false,
    },
    branch: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    },
    {
      timestamps: true, 
    }
  );
  
  module.exports = mongoose.model('BusPayment', BusPaymentSchema);