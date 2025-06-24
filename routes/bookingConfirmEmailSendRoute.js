const express = require("express");
const router = express.Router();
router.post("/send-confirmation-email", async (req, res) => {
  const { email, name, seatCount, amount } = req.body;

  const sendConfirmationEmail = require("../controllers/bookingConfirmEmail.js");
  const result = await sendConfirmationEmail(email, name, seatCount, amount);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

module.exports = router;