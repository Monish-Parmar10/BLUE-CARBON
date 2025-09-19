const express = require("express");
const router = express.Router();
const machinecontroller = require("./data/controllers/machinecontroller");

router.delete("/:id", machinecontroller.deleteMachine);
// ✅ Save machine
router.post("/", machinecontroller.addMachine);

// ✅ Get all machines
router.get("/", machinecontroller.getAllMachines);

// ✅ Get efficient machines
router.get("/efficient", machinecontroller.getEfficientMachines);

// ✅ Get inefficient machines
router.get("/inefficient", machinecontroller.getLeastEfficientMachines);

// ✅ Compare machine
router.post("/compare", machinecontroller.compareMachine);

module.exports = router;