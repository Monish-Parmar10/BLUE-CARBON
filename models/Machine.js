const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  category: { type: String },

  co2PerUnit: { type: Number },
  co2PerHour: { type: Number },

  productionPerHour: { type: Number },
  machineAge: { type: Number },
  machineAgeLimit: { type: Number },

  machineArea: { type: String },
  workingEnvironment: { type: String },
  companyLocation: { type: String },

  lastServiced: { type: Date },
  fuelType: { type: String },
  surroundingFactors: { type: String },
  machinePurpose: { type: String },
estimatedCO2: { type: Number },
 
});


module.exports = mongoose.model("Machine", machineSchema);
