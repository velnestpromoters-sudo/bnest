require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Property = require('./server/models/Property');

mongoose.connect(process.env.MONGO_URI).then(async () => {
   console.log("Connected");
   const props = await Property.find({});
   console.log("Total properties:", props.length);
   console.log("Active properties:", props.filter(p => p.isActive).length);
   if (props.length > 0) {
      console.log("Sample Active Property types:");
      props.filter(p => p.isActive).forEach(p => console.log(p.propertyType, p.location?.area, p.bhkType));
   }
   process.exit(0);
});
