const Machine = require('../../../models/Machine');

// Utility: Estimate CO₂ based on multiple factors
const estimateCO2 = (data) => {
let baseRate = data.co2PerUnit || data.co2PerHour || 0;
let adjustment = 1;

// Age factor
if (data.machineAge && data.machineAgeLimit) {
const ratio = data.machineAge / data.machineAgeLimit;
adjustment += ratio > 1 ? 0.3 : ratio * 0.2;
}

// Fuel type impact
const fuelImpact = {
diesel: 1.3,
petrol: 1.4,
electric: 0.8,
solar: 0.3,
gas: 1.1
};
if (data.fuelType) {
adjustment *= fuelImpact[data.fuelType.toLowerCase()] || 1;
}

// Environment
const envImpact = {
dusty: 1.2,
humid: 1.15,
clean: 0.9,
standard: 1
};
if (data.workingEnvironment) {
adjustment *= envImpact[data.workingEnvironment.toLowerCase()] || 1;
}

// Last serviced
if (data.lastServiced) {
const last = new Date(data.lastServiced);
const monthsOld = (Date.now() - last) / (1000 * 60 * 60 * 24 * 30);
adjustment += monthsOld > 12 ? 0.2 : monthsOld / 60;
}

return baseRate * adjustment;
};

// POST /machines
const addMachine = async (req, res) => {
try {
const data = req.body;
const estimatedCO2 = estimateCO2(data);
const machine = new Machine({ ...data, estimatedCO2 });
await machine.save();
res.status(201).json({ message: "Machine saved ✅", machine });
} catch (err) {
console.error("Add machine error:", err);
res.status(500).json({ error: "Server error" });
}
};

// GET /machines
const getAllMachines = async (req, res) => {
try {
const machines = await Machine.find();
res.json(machines);
} catch (err) {
res.status(500).json({ error: "Failed to fetch machines" });
}
};

// GET /machines/efficient
const getEfficientMachines = async (req, res) => {
try {
const machines = await Machine.find();
const filtered = machines.filter(m => m.estimatedCO2 && m.productionPerHour);
const sorted = filtered.sort((a, b) =>
(a.estimatedCO2 / a.productionPerHour) - (b.estimatedCO2 / b.productionPerHour)
);
const limit = parseInt(req.query.limit);
if (!isNaN(limit)) {
return res.json(sorted.slice(0, limit));
}
res.json(sorted);
} catch (err) {
res.status(500).json({ error: "Failed to fetch efficient machines" });
}
};

// GET /machines/inefficient
const getLeastEfficientMachines = async (req, res) => {
try {
const machines = await Machine.find();
const sorted = machines.sort((a, b) => b.estimatedCO2 - a.estimatedCO2);
res.json(sorted);
} catch (err) {
res.status(500).json({ error: "Failed to fetch inefficient machines" });
}
};

const deleteMachine = async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ message: "Machine deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete machine" });
  }
};
// POST /machines/compare
const calculateAndCompareCO2 = async (req, res) => {
try {
const inputData = req.body;
const inputCO2 = estimateCO2(inputData);
const machines = await Machine.find();
const comparisons = machines.map(machine => {
  return {
    _id: machine._id, // ✅ Add this
    name: machine.name,
    company: machine.company,
    inputCO2: inputCO2.toFixed(2),
    machineCO2: machine.estimatedCO2?.toFixed(2),
    difference: Math.abs((machine.estimatedCO2 || 0) - inputCO2).toFixed(2)
  };
});
res.json({ inputCO2: inputCO2.toFixed(2), comparisons });
} catch (err) {
console.error("Compare error:", err);
res.status(500).json({ error: "Failed to calculate and compare CO₂" });
}
};

module.exports = {
  addMachine,
  getAllMachines,
  getEfficientMachines,
  getLeastEfficientMachines,
  compareMachine: calculateAndCompareCO2,
  deleteMachine // ✅ Add this
};
