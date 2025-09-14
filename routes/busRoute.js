const express = require("express");

const router = express.Router();
const { addBus, loginBus, getBusById, getAllBusesPagination, calculateFare, updateBus, deleteBus, requestPasswordReset,
    verifyOTP,
    resetPassword,
    placeConfirm,
    getBusLocation, getLocations, getBusLocationbyID, getUserRole, updateBusRootId, getAllBusesWithBusRoot } = require("../controllers/BusController");

const busAuthentication = require("../middleware/busAuthentication.js")
const passangerAuthentication = require("../middleware/passangerAuthentication.js")

router.post("/addBus", addBus);
router.post("/loginBus", loginBus);

router.get("/getBusById/:id", getBusById);
router.get("/getUserRole", getUserRole);

router.get("/getAllBusesPagination", getAllBusesPagination);
router.get("/getAllBuses", getAllBusesWithBusRoot);

router.put("/updateBus/:id", updateBus);
router.delete("/deleteBus/:id", deleteBus);
router.put("/updateBusRootId/:busId", busAuthentication, updateBusRootId);

router.get("/getBusLocation", busAuthentication, getBusLocation);
router.get("/getBusLocationbyBusID/:busId", getBusLocationbyID);
router.get("/getLocations/:busId", passangerAuthentication, getLocations);
router.get("/calculateFare", passangerAuthentication, calculateFare);

router.post("/placeConfirm", busAuthentication, placeConfirm);



router.post('/sendEmail', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
module.exports = router;
