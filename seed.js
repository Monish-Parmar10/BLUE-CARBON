const User = require("./models/User");
const mongoose = require("mongoose");
const Machine = require("./models/Machine");

mongoose.connect("mongodb://localhost:27017/machineDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 👇 Same CO2 estimation logic from your controller
const estimateCO2 = (data) => {
  let baseRate = data.co2PerUnit || data.co2PerHour || 0;
  let adjustment = 1;

  if (data.machineAge && data.machineAgeLimit) {
    const ratio = data.machineAge / data.machineAgeLimit;
    adjustment += ratio > 1 ? 0.3 : ratio * 0.2;
  }

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

  const envImpact = {
    dusty: 1.2,
    humid: 1.15,
    clean: 0.9,
    standard: 1
  };
  if (data.workingEnvironment) {
    adjustment *= envImpact[data.workingEnvironment.toLowerCase()] || 1;
  }

  if (data.lastServiced) {
    const last = new Date(data.lastServiced);
    const monthsOld = (Date.now() - last) / (1000 * 60 * 60 * 24 * 30);
    adjustment += monthsOld > 12 ? 0.2 : monthsOld / 60;
  }

  return baseRate * adjustment;
};

const machines = [
  {
    name: "Textile Spinner A",
    company: "Spintex Pvt Ltd",
    category: "Textile",
    co2PerHour: 5.2,
    productionPerHour: 100,
    machineAge: 4,
    machineAgeLimit: 10,
    machineArea: "200 sqft",
    workingEnvironment: "dusty",
    companyLocation: "Ludhiana",
    lastServiced: "2023-06-15",
    fuelType: "diesel",
    surroundingFactors: "High temperature",
    machinePurpose: "Thread production"
  },
  {
    name: "Packaging Robot X5",
    company: "PackPro Solutions",
    category: "Packaging",
    co2PerUnit: 0.04,
    productionPerHour: 80,
    machineAge: 2,
    machineAgeLimit: 10,
    machineArea: "100 sqft",
    workingEnvironment: "clean",
    companyLocation: "Ahmedabad",
    lastServiced: "2024-02-12",
    fuelType: "electric",
    surroundingFactors: "Stable humidity",
    machinePurpose: "Box packaging"
  },
];

const users = [
 {
  username: "admin",
  password: "admin123", 
  role: "admin" 
},
  {
    username: "customer1",
    password: "cust123",
    role: "customer"
  }
];

async function seed() {
  try {
    await Machine.deleteMany();
    const withCO2 = machines.map(machine => ({
      ...machine,
      estimatedCO2: estimateCO2(machine)
    }));
    await Machine.insertMany(withCO2);
    console.log("✅ Machines inserted with estimatedCO2!");

   await User.deleteMany();

for (const userData of users) {
  const user = new User(userData);
  await user.save(); // ✅ triggers password hashing
}
    
    console.log("✅ Users seeded successfully!");

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Failed to seed data", err);
  }
}seed();
