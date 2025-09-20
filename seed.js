require("dotenv").config();

const User = require("./models/User");
const mongoose = require("mongoose");
const Machine = require("./models/Machine");

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
    gas: 1.1,
  };
  if (data.fuelType) {
    adjustment *= fuelImpact[data.fuelType.toLowerCase()] || 1;
  }

  const envImpact = {
    dusty: 1.2,
    humid: 1.15,
    clean: 0.9,
    standard: 1,
  };
  if (data.workingEnvironment) {
    adjustment *= envImpact[data.workingEnvironment.toLowerCase()] || 1;
  }

  if (data.lastServiced) {
    const lastServicedDate = new Date(data.lastServiced);
    const now = new Date();
    const monthsSinceService =
      (now.getFullYear() - lastServicedDate.getFullYear()) * 12 +
      (now.getMonth() - lastServicedDate.getMonth());
    if (monthsSinceService > 6) {
      adjustment += 0.15;
    }
  }

  return baseRate * adjustment;
};

const machines = [
  {
    name: "Drilling Machine 2.0",
    company: "DrillCorp",
    category: "Drilling",
    co2PerUnit: 0.2,
    productionPerHour: 50,
    machineAge: 5,
    machineAgeLimit: 15,
    machineArea: "500 sqft",
    workingEnvironment: "dusty",
    companyLocation: "Pune",
    lastServiced: "2024-01-20",
    fuelType: "electric",
    surroundingFactors: "High humidity",
    machinePurpose: "Hole drilling",
  },
  {
    name: "CNC Router Pro",
    company: "RouteMasters",
    category: "Cutting",
    co2PerUnit: 0.15,
    productionPerHour: 30,
    machineAge: 3,
    machineAgeLimit: 12,
    machineArea: "300 sqft",
    workingEnvironment: "clean",
    companyLocation: "Mumbai",
    lastServiced: "2023-11-05",
    fuelType: "electric",
    surroundingFactors: "Low noise area",
    machinePurpose: "Wood cutting",
  },
  {
    name: "Welding Robot 700",
    company: "WeldTech",
    category: "Welding",
    co2PerUnit: 0.3,
    productionPerHour: 15,
    machineAge: 7,
    machineAgeLimit: 20,
    machineArea: "450 sqft",
    workingEnvironment: "dusty",
    companyLocation: "Bangalore",
    lastServiced: "2024-03-10",
    fuelType: "gas",
    surroundingFactors: "High temperature",
    machinePurpose: "Metal joining",
  },
  {
    name: "Hydraulic Press P90",
    company: "PressWorks",
    category: "Pressing",
    co2PerUnit: 0.25,
    productionPerHour: 20,
    machineAge: 10,
    machineAgeLimit: 25,
    machineArea: "600 sqft",
    workingEnvironment: "standard",
    companyLocation: "Chennai",
    lastServiced: "2023-09-22",
    fuelType: "diesel",
    surroundingFactors: "Vibration prone area",
    machinePurpose: "Molding parts",
  },
  {
    name: "Textile Loom S10",
    company: "ThreadCrafters",
    category: "Textile",
    co2PerUnit: 0.1,
    productionPerHour: 10,
    machineAge: 8,
    machineAgeLimit: 10,
    machineArea: "200 sqft",
    workingEnvironment: "dusty",
    companyLocation: "Ludhiana",
    lastServiced: "2023-06-15",
    fuelType: "diesel",
    surroundingFactors: "High temperature",
    machinePurpose: "Thread production",
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
    machinePurpose: "Box packaging",
  },
];

const users = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    username: "customer1",
    password: "cust123",
    role: "customer",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connection established for seeding.");
    await Machine.deleteMany();
    const withCO2 = machines.map((machine) => ({
      ...machine,
      estimatedCO2: estimateCO2(machine),
    }));
    await Machine.insertMany(withCO2);
    console.log("✅ Machines inserted with estimatedCO2!");

    await User.deleteMany();
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log("✅ Users seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();