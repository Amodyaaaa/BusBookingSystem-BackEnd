const Bus = require('../models/BusModel');
const Booking = require('../models/bookingModel');
const Passenger = require('../models/PassangerModel');

const bookSeat = async (req, res) => {
  const { busId, passengerId, seatNumber, startPlace, endPlace, bookingDate, fare, distance } = req.body;

  try {
      const bus = await Bus.findById(busId).populate('busRootId');
      if (!bus) {
          return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
      }

      const route = bus.busRootId; // Correct reference to populated busRootId
      if (!route) {
          return res.status(404).json({ response_code: 404, success: false, message: 'Bus route not found' });
      }

      const startSegmentIndex = route.segments.findIndex(segment => segment.start_place === startPlace);
      const endSegmentIndex = route.segments.findIndex(segment => segment.end_place === endPlace);

      if (startSegmentIndex === -1 || endSegmentIndex === -1 || startSegmentIndex > endSegmentIndex) {
          return res.status(400).json({ response_code: 400, success: false, message: 'Invalid start or end place' });
      }

      if (seatNumber < 1 || seatNumber > bus.seat_count) {
          return res.status(400).json({ response_code: 400, success: false, message: 'Invalid seat number' });
      }

      // Check if the seat is already booked
      const existingSeatBooking = await Booking.findOne({ busId, seatNumber, bookingDate });
      if (existingSeatBooking) {
          return res.status(400).json({ response_code: 400, success: false, message: 'Seat already booked' });
      }

      // Check if the passenger has already booked the same route on the same date
      const existingPassengerBooking = await Booking.findOne({ 
          busId, 
          passengerId, 
          startPlace, 
          endPlace, 
          bookingDate 
      });
      if (existingPassengerBooking) {
          return res.status(400).json({ response_code: 400, success: false, message: 'Passenger has already booked this route on the same date' });
      }

      const totalBookings = await Booking.countDocuments({ busId, bookingDate });
      if (totalBookings >= bus.seat_count) {
          return res.status(400).json({ response_code: 400, success: false, message: 'Bus is fully booked' });
      }

      const booking = new Booking({
          busId,
          passengerId,
          seatNumber,
          startPlace,
          endPlace,
          bookingDate,
          distance: distance,
          fare: fare
      });

      await booking.save();

      res.status(200).json({ response_code: 200, success: true, message: 'Seat booked successfully', booking });
  } catch (error) {
      res.status(400).json({ response_code: 400, success: false, message: error.message });
  }
};



const checkAvailableSeats = async (req, res) => {
    const { busId, bookingDate } = req.query;
  
    try {
      // Get the bus details
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
      }
  
      // Get all bookings for the given bus and date
      const bookings = await Booking.find({ busId, bookingDate });
  
      // Get a list of booked seat numbers
      const bookedSeats = bookings.map(booking => booking.seatNumber);
  
      // Generate a list of all seat numbers
      const totalSeats = parseInt(bus.seat_count);
      const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
  
      // Filter out booked seats
      const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));
  
      res.status(200).json({ response_code: 200, success: true, availableSeats });
    } catch (error) {
      res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
  };



  const leaveBus = async (req, res) => {
    const { busId, passengerId, seatNumber } = req.body;

    try {
        const booking = await Booking.findOneAndDelete({ busId, passengerId, seatNumber });
        if (!booking) {
            return res.status(404).json({response_code: 404, success: false, message: 'Booking not found' });
        }

        res.status(200).json({response_code: 200, success: true, message: 'Booking released successfully', booking });
    } catch (error) {
        res.status(400).json({ response_code: 400,success: false, message: error.message });
    }
};




const checkPlaceSeatAvailability = async (req, res) => {
    const { busId, bookingDate, startPlace, endPlace } = req.query;

    try {
        // Get the bus details
        const bus = await Bus.findById(busId).populate('busRootId');
        if (!bus) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
        }

        const route = bus.busRootId;
        if (!route) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus route not found' });
        }

        const startSegmentIndex = route.segments.findIndex(segment => segment.start_place === startPlace);
        const endSegmentIndex = route.segments.findIndex(segment => segment.end_place === endPlace);

        if (startSegmentIndex === -1 || endSegmentIndex === -1 || startSegmentIndex > endSegmentIndex) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Invalid start or end place' });
        }

        // Get all bookings for the given bus, date, and segment range
        const bookings = await Booking.find({ busId, bookingDate });

        // Determine which seats are booked for the given segment range
        const bookedSeats = new Set();
        bookings.forEach(booking => {
            const bookingStartIndex = route.segments.findIndex(segment => segment.start_place === booking.startPlace);
            const bookingEndIndex = route.segments.findIndex(segment => segment.end_place === booking.endPlace);

            if ((startSegmentIndex >= bookingStartIndex && startSegmentIndex <= bookingEndIndex) || 
                (endSegmentIndex >= bookingStartIndex && endSegmentIndex <= bookingEndIndex) || 
                (startSegmentIndex <= bookingStartIndex && endSegmentIndex >= bookingEndIndex)) {
                bookedSeats.add(booking.seatNumber);
            }
        });

        // Generate a list of all seat numbers
        const totalSeats = parseInt(bus.seat_count);
        const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);

        // Filter out booked seats
        const availableSeats = allSeats.filter(seat => !bookedSeats.has(seat));

        res.status(200).json({ response_code: 200, success: true, availableSeats:availableSeats ,totalSeats:totalSeats });
    } catch (error) {
        res.status(500).json({ response_code: 500, success: false, message: error.message });
    }
};



const getBookingsByPassengerId = async (req, res) => {
    const { passengerId } = req.params;
  
    try {
      const bookings = await Booking.find({ passengerId }).populate('busId');
  
      if (!bookings.length) {
        return res.status(404).json({response_code: 404, success: false, message: 'No bookings found for this passenger' });
      }
  
      res.status(200).json({ response_code: 200,success: true, bookings });
    } catch (error) {
      res.status(400).json({response_code: 400, success: false, message: error.message });
    }
  };




  const getBookingsByBusId = async (req, res) => {
    const { busId } = req.params;

    try {
      const bookings = await Booking.find({ busId }).sort({ bookingDate: -1 }).exec();
  
      const passengerIds = bookings.map(booking => booking.passengerId);
  
      const passengers = await Passenger.find({ _id: { $in: passengerIds } }).exec();
  
      const combinedResults = bookings.map(booking => {
        const passenger = passengers.find(passenger => passenger._id.equals(booking.passengerId));
        return {
            passenger: passenger ? {
                _id: passenger._id,
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                phoneNumber:passenger.phoneNumber,
                email: passenger.email,
              } : null,
          seatNumber: booking.seatNumber,
          startPlace: booking.startPlace,
          endPlace: booking.endPlace,
          bookingDate: booking.bookingDate,
          distance: booking.distance,
          fare: booking.fare,

        };
      });
  
      res.status(200).json({response_code: 200, success: true, bookings: combinedResults });
    } catch (error) {
      res.status(400).json({ response_code: 400,success: false, message: error.message });
    }
  };

module.exports = { bookSeat,getBookingsByBusId, checkAvailableSeats,leaveBus,checkPlaceSeatAvailability,getBookingsByPassengerId};
