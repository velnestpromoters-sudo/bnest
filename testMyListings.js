require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Property = require('./server/models/Property');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const allProperties = await Property.find();
  console.log("TOTAL PROPERTIES IN DB:", allProperties.length);
  
  if (allProperties.length > 0) {
      console.log("First Property Owner ID:", allProperties[0].ownerId);
      console.log("IsActive:", allProperties[0].isActive);
  }

  process.exit(0);
}
run();
