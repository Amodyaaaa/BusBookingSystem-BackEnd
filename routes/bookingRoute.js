const express = require("express");

const router = express.Router();
const { bookSeat ,checkAvailableSeats,leaveBus ,checkPlaceSeatAvailability,getBookingsByPassengerId,getBookingsByBusId} = require("../controllers/bookingController");
const passangerAuthentication= require ("../middleware/passangerAuthentication.js")


router.post("/bookSeat",passangerAuthentication, bookSeat);
router.get("/checkAvailableSeats", checkAvailableSeats);
router.post("/leaveBus", passangerAuthentication,leaveBus);
router.get("/checkSeats", checkPlaceSeatAvailability);
router.get("/getBookings/:passengerId", getBookingsByPassengerId);
router.get("/getbusBookings/:busId", getBookingsByBusId);


module.exports = router;