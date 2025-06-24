const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BusSchema = new Schema(
    {
        Bus_name: {
            type: String,
            required: true,
        },
        seat_count: {
            type: Number,
            required: true,
        },
        number_plate: {
            type: String,
            required: true,
        },
        register_province: {
            type: String,
            required: true,
        },
        bus_status: {
            type: String,
            required: false,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        email: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false,
        },
        busRootId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusRoot',
            required: false
        },
        hasbusRoot :{
            type:Boolean,
            default:false,
            required:false
        },
        resetPasswordOTP: {
            type: String,
         },
        resetPasswordOTPExpiry: {
            type: Date,
        },
        role :{
            type:String,
            default:"bus",
            required:true
        }
    }
)

module.exports = mongoose.model("Bus", BusSchema);
