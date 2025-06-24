const express = require("express");

const router = express.Router();
const {addBusPaymentDetails,getBusPaymentDetails ,getAllBusPaymentDetails,updateBusPaymentDetails,deleteBusPaymentDetails,getBusPaymentDetailsByBusId} = require("../controllers/busPaymentController");
const busAuthentication= require ("../middleware/busAuthentication.js")


router.post("/addPaymentDetails",busAuthentication, addBusPaymentDetails);
router.get("/getBusPaymentDetails/:id", getBusPaymentDetails);
router.get("/getAllBusPayments", getAllBusPaymentDetails);
router.put("/updateBusPayment/:id", updateBusPaymentDetails);
router.delete("/deleteBusPayment/:id", deleteBusPaymentDetails);
router.get("/getBusPaymentbybusId",busAuthentication, getBusPaymentDetailsByBusId);

module.exports = router;
