const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
const { getAllPassengers,
    addPassanger,
    getPassengerById,
    updatePassenger,
    deletePassenger,
    loginPassanger,
    requestPasswordReset,
    verifyOTP,
    resetPassword } = require("../controllers/PassangerController");

router.post("/addPassanger", addPassanger);
router.post("/login", loginPassanger);
router.delete("/deletePassenger/:id", deletePassenger);
router.get("/getAllPassengers", getAllPassengers);
router.put("/updatePassenger/:id", updatePassenger);
router.get("/getPassengerById/:id", getPassengerById);


router.post('/sendEmail', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
module.exports = router;
