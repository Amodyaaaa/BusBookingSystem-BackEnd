const BusModel = require("../models/BusModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const BusRootModel = require("../models/BusRootModel");
const nodemailer = require('nodemailer');
const SegmentArrival = require("../models/segmentModel");


const createToken = (_id,role,hasbusRoot) => {
    return jwt.sign({ _id,role,hasbusRoot}, process.env.SECRET, { expiresIn: 259200 });
};
const addBus = async (req, res) => {
    const { Bus_name, seat_count, number_plate, register_province,email,password } = req.body;
    try {
        // Check if all required fields are provided
        if (
            !Bus_name ||
            !seat_count ||
            !number_plate ||
            !register_province ||
            !email ||
            !password 
            
           
        ) {
            throw new Error("All fields must be filled");
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
        // Check if the busRootId exists in the database
       

        // Check if a bus with the same name already exists
        const existingBus = await BusModel.findOne({ email });
        if (existingBus) {
            throw new Error("Bus already exists");
        }
        const hashedPassword = bcrypt.hashSync(password, 12);

        // Create a new bus instance
        const bus = new BusModel({
            Bus_name,
            seat_count,
            number_plate,
            register_province,
            email,
            password:hashedPassword,
              // Make sure to include the busRootId in the new bus entry
        });

        // Save the new bus to the database
        await bus.save();
        const bustoken = createToken(bus._id,bus.role,bus.hasbusRoot);

        // Send a success response
        res.status(200).json({
            response_code: 200,
            success: true,
            message: "Bus added Successfully",
            bus,
            bustoken,
        });
    } catch (error) {
        // Send an error response
        res.status(400).json({
            response_code: 400,
            success: false,
            error: error.message
        });
    }
};

const loginBus = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw Error("Email and password are required");
        }

        const bus = await BusModel.findOne({ email: email });
        if (!bus) {
            throw Error("Invalid email");
        }

        const isPasswordValid = bcrypt.compareSync(password, bus.password);
        if (!isPasswordValid) {
            throw Error("Invalid password");
        }

        const bustoken = createToken(bus._id,bus.role,bus.hasbusRoot,bus.hasbusRoot);
        res.status(200).json({ response_code: 200, success: true,bustoken,bus });
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

        const bus = await BusModel.findOne({ email: email });
        if (!bus) {
            throw Error("User not found");
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 3600000; // OTP valid for 1 hour

        bus.resetPasswordOTP = otp;
        bus.resetPasswordOTPExpiry = otpExpiry;

        await bus.save();

         sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}. It is valid for 1 hour.`);

        res.status(200).json({ response_code: 200, success: true, message: 'OTP sent successfully!' });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};


const getUserRole = async (req, res, next) => {
    const { authorization } = req.headers;
   
    const token = authorization.split(" ")[1];
    try {
      const { role} = jwt.verify(token, process.env.SECRET);
      res.status(200).json({ response_code: 200, success: true, role });

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

        const bus = await BusModel.findOne({ email: email });
        if (!bus) {
            throw Error("User not found");
        }

        if (bus.resetPasswordOTP !== otp) {
            throw Error("Invalid OTP");
        }

        if (bus.resetPasswordOTPExpiry < Date.now()) {
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

        const bus = await BusModel.findOne({ email: email });
        if (!bus) {
            throw Error("User not found");
        }

        if (bus.resetPasswordOTP !== otp) {
            throw Error("Invalid OTP");
        }

        if (bus.resetPasswordOTPExpiry < Date.now()) {
            throw Error("OTP expired");
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 12);
        bus.password = hashedPassword;
        bus.resetPasswordOTP = undefined;
        bus.resetPasswordOTPExpiry = undefined;

        await bus.save();

        res.status(200).json({ response_code: 200, success: true, message: 'Password reset successfully!' });

    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};


const placeConfirm = async (req, res) => {
    const { segmentId } = req.body; // Get the segment ID from the request body

    try {
        const busId = req.busId._id;

        // Validate input
        if (!segmentId) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        // Find the bus and its root
        const bus = await BusModel.findById(busId).populate('busRootId');
        if (!bus) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
        }

        const busRoot = bus.busRootId; // Access the populated busRootId field
        if (!busRoot || !busRoot.segments) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Segments not found' });
        }

        // Find the segment by ID
        const segment = busRoot.segments.find(seg => seg._id.toString() === segmentId);
        if (!segment) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Segment not found' });
        }

        // Create a new segment arrival record
        const segmentArrival = new SegmentArrival({
            bus: busId,
            segment: segment._id,
        });
        await segmentArrival.save();

        // Optionally, update bus status or perform other actions
        bus.bus_status = 'active'; // Update bus status if necessary
        await bus.save();

        res.status(200).json({ response_code: 200, success: true, message: 'Segment arrival confirmed', segmentArrival });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};


const getBusLocation = async (req, res) => {
    try {
        const busId = req.busId._id;

        // Validate input
        if (!busId) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Bus ID is required' });
        }

        // Find the bus
        const bus = await BusModel.findById(busId).populate('busRootId');
        if (!bus) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
        }

        // Find the latest segment arrival record for the bus
        const latestArrival = await SegmentArrival.findOne({ bus: busId })
            .sort({ arrival_time: -1 }); // Sort by arrival_time descending to get the latest

        let segment = null;
        if (latestArrival) {
            const busRoot = await BusRootModel.findById(bus.busRootId);
            if (busRoot) {
                segment = busRoot.segments.id(latestArrival.segment);
            }

        }
        // Return the bus and segment arrival data
        res.status(200).json({
            response_code: 200,
            success: true,
            bus: {
                Bus_name: bus.Bus_name,
                seat_count: bus.seat_count,
                bus_type: bus.bus_type,
                number_plate: bus.number_plate,
                register_province: bus.register_province,
                bus_status: bus.bus_status,
                segments :bus.busRootId
            },
            latestArrival: latestArrival ? {
                location: latestArrival.location,
                segmentId: latestArrival.segment,
                arrival_time: latestArrival.arrival_time,
            } : null
        });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};


const getBusLocationbyID = async (req, res) => {
    try {
        const {busId} = req.params;

        // Validate input
        if (!busId) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Bus ID is required' });
        }

        // Find the bus
        const bus = await BusModel.findById(busId).populate('busRootId');
        if (!bus) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
        }

        // Find the latest segment arrival record for the bus
        const latestArrival = await SegmentArrival.findOne({ bus: busId })
            .sort({ arrival_time: -1 }); // Sort by arrival_time descending to get the latest

        let segment = null;
        if (latestArrival) {
            const busRoot = await BusRootModel.findById(bus.busRootId);
            if (busRoot) {
                segment = busRoot.segments.id(latestArrival.segment);
            }

        }
        // Return the bus and segment arrival data
        res.status(200).json({
            response_code: 200,
            success: true,
            bus: {
                Bus_name: bus.Bus_name,
                seat_count: bus.seat_count,
                bus_type: bus.bus_type,
                number_plate: bus.number_plate,
                register_province: bus.register_province,
                bus_status: bus.bus_status,
                segments :bus.busRootId
            },
            latestArrival: latestArrival ? {
                location: latestArrival.location,
                segmentId: latestArrival.segment,
                arrival_time: latestArrival.arrival_time,
            } : null
        });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};


const getLocations = async (req, res) => {
    try {
        const { busId } = req.params;

        // Validate input
        if (!busId) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Bus ID is required' });
        }

        // Find the bus
        const bus = await BusModel.findById(busId).populate('busRootId');
        if (!bus) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus not found' });
        }

        let places = [];
            const busRoot = await BusRootModel.findById(bus.busRootId);
            if (busRoot) {
                const startPlaces = busRoot.segments.map(seg => seg.start_place);
                const endPlaces = busRoot.segments.map(seg => seg.end_place);
                places = Array.from(new Set([...startPlaces, ...endPlaces])); // Combine and remove duplicates
            }
        

        // Return only the distinct places
        res.status(200).json({
            response_code: 200,
            success: true,
            bus: {
                places
            }
        });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};

const getBusById = async (req, res) => {
    const { id } = req.params;
    try {
        const bus = await BusModel.findById(id);
        if (!bus) {
            throw Error("Bus not found");
        }
        res.status(200).json({ response_code: 200, success: true, bus });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const getAllBusesPagination = async (req, res) => {
    console.log(req.query);
    const { search = "" } = req.query;

    try {
        // Query for searching within Bus fields
        const busQuery = {
            $or: [
                { Bus_name: { $regex: search, $options: "i" } },
             
            ],
            // busRootId: { $exists: true, $ne: null } // Ensure busRootId is not null or undefined
        };

        const buses = await BusModel.find(busQuery)
            .populate('busRootId')
            .exec();

        // console.log(buses);
        const total = await BusModel.countDocuments(busQuery);

        res.status(200).json({
            response_code: 200,
            success: true,
            total,
            buses,
        });
    } catch (error) {
        console.error("Error fetching buses:", error);
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};




const getAllBusesWithBusRoot = async (req, res) => {
    try {
        const buses = await BusModel.find().populate('busRootId').exec();
        res.status(200).json({ response_code: 200,success: true, buses });
    } catch (error) {
        res.status(400).json({ response_code: 400,success: false, message: error.message });
    }
};

const updateBus = async (req, res) => {
    const { id } = req.params;
    const { Bus_name, seat_count, bus_type, number_plate, register_province } = req.body;
    try {
        if (!Bus_name || !seat_count || !bus_type || !number_plate || !register_province) {
            throw Error("All fields must be filled");
        }

        const bus = await BusModel.findByIdAndUpdate(
            id,
            { Bus_name, seat_count, bus_type, number_plate, register_province },
            { new: true }
        );

        if (!bus) {
            throw Error("Bus not found");
        }

        res.status(200).json({ response_code: 200, success: true, message: "Bus updated successfully", bus });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const deleteBus = async (req, res) => {
    const { id } = req.params;
    try {
        const bus = await BusModel.findByIdAndDelete(id);

        if (!bus) {
            throw Error("Bus not found");
        }

        res.status(200).json({ response_code: 200, success: true, message: "Bus deleted successfully" });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const updateBusRootId = async (req, res) => {
    const { busId } = req.params;
    const { busRootId } = req.body;
    try {
        const bus = await BusModel.findById(busId);

        if (!bus) {
            return res.status(404).json({ response_code: 404,success: false, message: 'Bus not found' });
        }

        bus.busRootId = busRootId;
        bus.hasbusRoot = true; // Set hasBusRoot to true when busRootId is updated
        await bus.save();

        res.status(200).json({ response_code: 200,success: true, message: 'Bus root ID updated successfully', bus });
    } catch (error) {
        res.status(500).json({ response_code: 400,success: false, message: error.message });
    }
};
module.exports = {
    addBus,
    getBusById,
    getAllBusesPagination,
    updateBus,
    deleteBus,
    loginBus,
    requestPasswordReset,
    resetPassword,
    verifyOTP,
    placeConfirm,
    getBusLocation,
    updateBusRootId,
    getAllBusesWithBusRoot,
    getUserRole,
    getBusLocationbyID,
    getLocations
}
