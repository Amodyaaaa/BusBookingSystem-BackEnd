const express = require("express");

const router = express.Router();
const { addBusRoot ,getBusRootBybusId,getBusRootById,getAllBusRootPagination,updateBusRoot,deleteBusRoot } = require("../controllers/BusRootController");
const busAuthentication= require ("../middleware/busAuthentication.js")


router.post("/addBusRoot", busAuthentication,addBusRoot);
router.get("/getBusRootById/:id",getBusRootById);
router.get("/getAllBusRootPagination", getAllBusRootPagination);
router.put("/updateBusRoot",busAuthentication, updateBusRoot );
router.delete("/deleteBusRoot/:id", deleteBusRoot );
router.get("/getBusRootBybusId",busAuthentication,getBusRootBybusId);

module.exports = router;
