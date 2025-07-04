const jwt = require("jsonwebtoken");
const busModel = require("../models/BusModel");


const busAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authorization.split(" ")[1];
  try {
    const { _id} = jwt.verify(token, process.env.SECRET);
    req.busId = await busModel.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = busAuthentication;
