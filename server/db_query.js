require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const allProperties = await Property.find();
  console.log("TOTAL PROPERTIES:", allProperties.length);
  
  if (allProperties.length > 0) {
      console.log(allProperties.map(p => ({
         title: p.title, 
         id: p._id, 
         isActive: p.isActive,
         paymentStatus: p.listingPaymentStatus
      })));
  }

  process.exit(0);
}
run();
