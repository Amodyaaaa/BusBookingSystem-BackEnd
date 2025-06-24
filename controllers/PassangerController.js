const PassangerModel = require("../models/PassangerModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');

const createToken = (_id,role) => {
    return jwt.sign({ _id ,role}, process.env.SECRET, { expiresIn: 259200 });
};



const addPassanger = async (req, res) => {
    const { firstName,lastName, gender, phoneNumber,email,password } = req.body;
    try {


        if (
            !email ||
            !password ||
            !firstName ||
            !lastName||
            !gender ||
            !phoneNumber 
        
        ) {
            throw Error("All fields must be filled");
        }
        if (!validator.isLength(password, { min: 8 })) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (!validator.isEmail(email)) {
            throw Error("Email not valid");
        }
        // if (!validator.isStrongPassword(password)) {
        //     throw Error("Password not strong enough");
        // }

        const existingUsers = await PassangerModel.findOne({ email: email });
        if (existingUsers) {
            throw Error("User already exists"); 
        }
        const hashedPassword = bcrypt.hashSync(password, 12);
        const Passanger = new PassangerModel({
            firstName,
            lastName,
            gender,
            phoneNumber,
            email,
            password:hashedPassword
        });

        await Passanger.save();
        const passangertoken = createToken(Passanger._id,Passanger.role);

        res.status(200).json({ response_code: 200, success: true,message: 'Passanger Register successfully!', Passanger,passangertoken });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false,error: error.message });
    }

}


const getAllPassengers = async (req, res) => {
    try {
        const passengers = await PassangerModel.find();
        res.status(200).json({response_code: 200, success: true,passengers});
    } catch (error) {
        res.status(400).json({response_code: 400, success: false, error: error.message });
    }
};
const getPassengerById = async (req, res) => {
    const { id } = req.params;
    try {
        const passenger = await PassangerModel.findById(id);
        if (!passenger) {
            return res.status(404).json({response_code: 404, success: false, message: 'Passenger not found' });
        }
        res.status(200).json({response_code: 200, success: true,passenger});
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false,error: error.message });
    }
};
const updatePassenger = async (req, res) => {
    const { id } = req.params;
    const {firstName, lastName, gender, phoneNumber } = req.body;
    try {
        const passenger = await PassangerModel.findByIdAndUpdate(id, { firstName, lastName, gender, phoneNumber }, { new: true });
        if (!passenger) {
            return res.status(404).json({response_code: 404, success: false, message: 'Passenger not found' });
        }
        res.status(200).json({response_code: 200, success: true, message: 'Passenger updated successfully!', passenger });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false,error: error.message });
    }
};
const loginPassanger = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw Error("Email and password are required");
        }

        const passanger = await PassangerModel.findOne({ email: email });
        if (!passanger) {
            throw Error("Invalid email");
        }

        const isPasswordValid = bcrypt.compareSync(password, passanger.password);
        if (!isPasswordValid) {
            throw Error("Invalid password");
        }

        const passangertoken = createToken(passanger._id,passanger.role);
        res.status(200).json({ response_code: 200, success: true,passanger,passangertoken });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false,error: error.message });
    }
};


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

const sendEmail = (email, subject, text) => {
    // Use a nodemailer or any email service to send email
    // For simplicity, here is a basic example using nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hasthiyatalentoc@gmail.com',
            pass: 'jaokcskonjeshdvl'
        }
    });

    const mailOptions = {
        from: 'hasthiyatalentoc@gmail.com',
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            throw Error("Email is required");
        }
        if (!validator.isEmail(email)) {
            throw Error("Email not valid");
        }

        const user = await PassangerModel.findOne({ email: email });
        if (!user) {
            throw Error("User not found");
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 3600000; // OTP valid for 1 hour

        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpiry = otpExpiry;

        await user.save();

         sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}. It is valid for 1 hour.`);

        res.status(200).json({ response_code: 200, success: true, message: 'OTP sent successfully!' });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            throw Error("Email and OTP are required");
        }

        const user = await PassangerModel.findOne({ email: email });
        if (!user) {
            throw Error("User not found");
        }

        if (user.resetPasswordOTP !== otp) {
            throw Error("Invalid OTP");
        }

        if (user.resetPasswordOTPExpiry < Date.now()) {
            throw Error("OTP expired");
        }

        res.status(200).json({ response_code: 200, success: true, message: 'OTP verified successfully!' });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        if (!email || !otp || !newPassword) {
            throw Error("Email, OTP, and new password are required");
        }

        if (!validator.isLength(newPassword, { min: 8 })) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (!validator.isStrongPassword(newPassword)) {
            throw Error("Password not strong enough");
        }

        const user = await PassangerModel.findOne({ email: email });
        if (!user) {
            throw Error("User not found");
        }

        if (user.resetPasswordOTP !== otp) {
            throw Error("Invalid OTP");
        }

        if (user.resetPasswordOTPExpiry < Date.now()) {
            throw Error("OTP expired");
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiry = undefined;

        await user.save();

        res.status(200).json({ response_code: 200, success: true, message: 'Password reset successfully!' });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const deletePassenger = async (req, res) => {
    const { id } = req.params;
    try {
        const passenger = await PassangerModel.findByIdAndDelete(id);
        if (!passenger) {
            return res.status(404).json({ response_code: 404, success: false,message: 'Passenger not found' });
        }
        res.status(200).json({ response_code: 200, success: true,message: 'Passenger deleted successfully!' });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false,error: error.message });
    }
};
module.exports = {
    getAllPassengers,
    addPassanger,
    getPassengerById,
    updatePassenger,
    deletePassenger,
    loginPassanger,
    requestPasswordReset,
    verifyOTP,
    resetPassword
}
