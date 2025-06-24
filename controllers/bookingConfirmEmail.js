const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (email, name, seatCount, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Booking Confirmation",
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear ${name},</p>
      <p>Thank you for your booking. Here are the details:</p>
      <ul>
        <li>Number of seats: ${seatCount}</li>
        <li>Total amount: $${amount / 100}</li>
      </ul>
      <p>We look forward to serving you!</p>
      <p>Best regards,<br>Your Bus Booking Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
    return { success: true, message: "Confirmation email sent successfully" };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, message: "Failed to send confirmation email" };
  }
};

module.exports = {
  sendConfirmationEmail,
};
