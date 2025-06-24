const BusPaymentModel = require("../models/BusPaymentModel");
const BusModel = require("../models/BusModel");


const addBusPaymentDetails = async (req, res) => {
    const {  AcNo, bankname, branch, phoneNumber } = req.body;
  
    try {
      const busId = req.busId._id;

      // Check if all fields are filled
      if (!busId || !AcNo || !bankname || !branch || !phoneNumber) {
        throw new Error('All fields must be filled');
      }
  
      // Check if busId is valid
      const bus = await BusModel.findById(busId);
      if (!bus) {
        return res.status(400).send({
          response_code: 400,
          success: false,
          message: 'Invalid bus ID',
        });
      }
  
      // Check if busId already has a BusPayment
      const existingBusPayment = await BusPaymentModel.findOne({ busId });
      if (existingBusPayment) {
        return res.status(400).send({
          response_code: 400,
          success: false,
          message: 'Bus Payment  Details already exists for this bus ',
        });
      }
  
      // Create and save the new BusPayment
      const busPayment = new BusPaymentModel({
        busId,
        AcNo,
        bankname,
        branch,
        phoneNumber,
      });
 
      await busPayment.save();
  
      res.status(200).send({
        response_code: 200,
        success: true,
        message: 'Bus payment details added successfully',
        busPayment,
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: message,
      });
    }
  };

  const getBusPaymentDetails = async (req, res) => {
    const { id } = req.params;
  
    try {
      const busPayment = await BusPaymentModel.findById(id).populate('busId');
      if (!busPayment) {
        return res.status(404).send({
          response_code: 404,
          success: false,
          message: 'Bus payment details not found',
        });
      }
  
      res.status(200).send({
        response_code: 200,
        success: true,
        busPayment,
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: error.message,
      });
    }
  };


  const getAllBusPaymentDetails = async (req, res) => {
    try {
      const busPayments = await BusPaymentModel.find().populate('busId');
      res.status(200).send({
        response_code: 200,
        success: true,
        busPayments,
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: error.message,
      });
    }
  };

  const updateBusPaymentDetails = async (req, res) => {
    const { id } = req.params;
    const { AcNo, bankname, branch, phoneNumber } = req.body;
  
    try {
      const busPayment = await BusPaymentModel.findByIdAndUpdate(
        id,
        { AcNo, bankname, branch, phoneNumber },
        { new: true, runValidators: true }
      );
  
      if (!busPayment) {
        return res.status(404).send({
          response_code: 404,
          success: false,
          message: 'Bus payment details not found',
        });
      }
  
      res.status(200).send({
        response_code: 200,
        success: true,
        message: 'Bus payment details updated successfully',
        busPayment,
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: error.message,
      });
    }
  };


  const deleteBusPaymentDetails = async (req, res) => {
    const { id } = req.params;
  
    try {
      const busPayment = await BusPaymentModel.findByIdAndDelete(id).populate('busId');
  
      if (!busPayment) {
        return res.status(404).send({
          response_code: 404,
          success: false,
          message: 'Bus payment details not found',
        });
      }
  
      res.status(200).send({
        response_code: 200,
        success: true,
        message: 'Bus payment details deleted successfully',
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: error.message,
      });
    }
  };
  
  // Get bus payment details by bus ID
  const getBusPaymentDetailsByBusId = async (req, res) => {
    const busId = req.busId._id;
  
    try {
      const busPayment = await BusPaymentModel.findOne({ busId }).populate('busId');
      if (!busPayment) {
        return res.status(404).send({
          response_code: 404,
          success: false,
          message: 'Bus payment details not found',
        });
      }
  
      res.status(200).send({
        response_code: 200,
        success: true,
        busPayment,
      });
    } catch (error) {
      res.status(400).send({
        response_code: 400,
        success: false,
        message: error.message,
      });
    }
  };
module.exports = {
    addBusPaymentDetails,
    getBusPaymentDetails,
    getAllBusPaymentDetails,
    updateBusPaymentDetails,
    getBusPaymentDetailsByBusId,
    deleteBusPaymentDetails
}