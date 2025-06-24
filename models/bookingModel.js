const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    startPlace: {
      type: String,
      required: true,
    },
    endPlace: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
