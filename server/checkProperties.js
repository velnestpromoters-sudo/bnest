require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function test() {
   await mongoose.connect(process.env.MONGO_URI);
   const total = await Property.countDocuments();
   const active = await Property.countDocuments({ isActive: true });
   const verifiedAndActive = await Property.countDocuments({ isActive: true, isVerified: true });
   
   console.log('Total Properties:', total);
   console.log('Active:', active);
   console.log('Active & Verified:', verifiedAndActive);
   process.exit();
}
test();
