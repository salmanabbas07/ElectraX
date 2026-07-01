import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "admin@electrax.com" });

    if (existingAdmin) {
      console.log("Admin account already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin",
      email: "admin@electrax.com",
      password: "admin123",
      role: "admin",
      phone: "9876543210",
      address: {
        street: "Admin Street",
        city: "Admin City",
        state: "Admin State",
        zipcode: "000000",
      },
    });

    console.log("Admin account created successfully:");
    console.log("Email: admin@electrax.com");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
