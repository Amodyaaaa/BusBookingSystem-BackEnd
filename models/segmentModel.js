const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SegmentArrivalSchema = new Schema(
    {
        bus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
        },
        segment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusRoot',
            required: true,
        },
        arrival_time: {
            type: Date,
            default: Date.now,
        },
      
    }
);

module.exports = mongoose.model("SegmentArrival", SegmentArrivalSchema);