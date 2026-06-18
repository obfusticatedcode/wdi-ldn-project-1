require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");

const dbURI = process.env.MONGODB_URI || "mongodb://localhost/trade-space";

async function seed() {
  await mongoose.connect(dbURI);
  console.log("MongoDB connected");

  await Post.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared existing data");

  const [alice, bob, chisomo] = await User.create([
    {
      username: "alice",
      email: "alice@test.com",
      password: "password123",
      passwordConfirmation: "password123",
      image: "/assets/images/iphone-being-held.jpg"
    },
    {
      username: "bob",
      email: "bob@test.com",
      password: "password123",
      passwordConfirmation: "password123",
      image: "/assets/images/shopping-cart.jpg"
    },
    {
      username: "chisomo",
      email: "chisomo@test.com",
      password: "password123",
      passwordConfirmation: "password123",
      image: "/assets/images/cheese.jpg"
    }
  ]);

  console.log("Created users: alice, bob, chisomo (password: password123)");

  await Post.create([
    {
      title: "iPhone 7 — Good condition",
      category: "Electronics",
      price: 120,
      currency: "USD",
      description: "Used iPhone 7, 128GB, space grey. Minor scratches on the back, screen is perfect. Comes with charger.",
      location: "8FVC9G8F+6W",
      lat: 51.5014,
      lng: -0.1419,
      email: "alice@test.com",
      image: "/assets/images/iPhone7.jpg",
      createdBy: alice._id
    },
    {
      title: "MacBook Pro 2015",
      category: "Electronics",
      price: 450,
      currency: "USD",
      description: "MacBook Pro 13-inch 2015. 8GB RAM, 256GB SSD. Works perfectly, battery holds 4 hours.",
      location: "8FVC9G8F+3Q",
      lat: 51.4993,
      lng: -0.1366,
      email: "alice@test.com",
      image: "/assets/images/MacBook-Pro-2015-Design_thumb800.jpg",
      createdBy: alice._id
    },
    {
      title: "Leather Armchair",
      category: "Furniture",
      price: 85,
      currency: "GBP",
      description: "Brown leather scroll wing armchair. Very comfortable, slight wear on the armrests. Collection only.",
      location: "8FVC9G8F+9V",
      lat: 51.5074,
      lng: -0.1278,
      email: "bob@test.com",
      image: "/assets/images/scroll-wing-chair-leather.jpg",
      createdBy: bob._id
    },
    {
      title: "Galaxy S8 — Unlocked",
      category: "Electronics",
      price: 95,
      currency: "GBP",
      description: "Samsung Galaxy S8, midnight black, fully unlocked. Screen has a small crack in the bottom corner but works perfectly.",
      location: "8FVC9G8F+2H",
      lat: 51.5033,
      lng: -0.1195,
      email: "bob@test.com",
      image: "/assets/images/galaxy-s8.jpg",
      createdBy: bob._id
    },
    {
      title: "Fresh goat cheese — weekly market",
      category: "Food",
      price: 8,
      currency: "GBP",
      description: "Homemade goat cheese, available every Saturday morning. Soft and hard varieties. Order in advance for larger quantities.",
      location: "8FVC9G8F+5M",
      lat: 51.5045,
      lng: -0.1256,
      email: "chisomo@test.com",
      image: "/assets/images/cheese.jpg",
      createdBy: chisomo._id,
      comments: [
        { content: "Is this still available?", createdBy: alice._id },
        { content: "Yes! I'll be at the market this Saturday.", createdBy: chisomo._id }
      ]
    },
    {
      title: "Phone cases bundle — various models",
      category: "Electronics",
      price: 15,
      currency: "GBP",
      description: "Bundle of 10 mixed phone cases, various brands and sizes. Great for resale. Some new, some used.",
      location: "8FVC9G8F+4J",
      lat: 51.5062,
      lng: -0.1387,
      email: "chisomo@test.com",
      image: "/assets/images/phoneCovers.jpg",
      createdBy: chisomo._id
    }
  ]);

  console.log("Created 6 posts");
  console.log("\nTest accounts:");
  console.log("  alice@test.com   / password123");
  console.log("  bob@test.com     / password123");
  console.log("  chisomo@test.com / password123");

  await mongoose.disconnect();
  console.log("\nDone.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
