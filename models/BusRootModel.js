const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SegmentSchema = new Schema({
    start_place: {
        type: String,
        required: false,
    },
    end_place: {
        type: String,
        required: false,
    },

    index: {
        type: Number,
        required: false,
    },
    distance: {
        type: Number,
        required: true,
    },
    travel_time: {
        type: String,
        required: true,
    },
});

const BusRootSchema = new Schema(
    {
        root_number: {
            type: String,
            required: true,
        },
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
        },
        start_time: {
            type: Date,
            required: false,
        },
        fee:{
            type: Number,
            required: true,
        },
        segments: [SegmentSchema],
    }
);


module.exports = mongoose.model("BusRoot", BusRootSchema);
