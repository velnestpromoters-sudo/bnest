const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      lat, lng, radius = 5,
      maxPrice, minPrice, priceCategory,
      propertyType,
      gender,
      sharing,
      bhkType,
      bachelorAllowed,
      sort,
      locationText,
      nearLandmark,
      availableBeds,
      furnishing,
      available,
      availabilityDate,
      amenities,
      roomCount,
      requiredCapacity,
      ownerPreference,
      isVerified,
      exclude,
      wishlistOnly // Handled in a separate context natively later or handled via array filtering
    } = req.query;

    let query = { isActive: true };

    // 1. Geography & Bounding (Using $near natively sorts by distance)
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      };
    } else if (locationText) {
      // Fallback matching if we don't have exact lat/lng hooks from Photon Geocoder
      const locs = locationText.split(',').map(l => new RegExp(l.trim(), "i"));
      query["$or"] = [
          { "location.area": { $in: locs } },
          { "location.city": { $in: locs } },
          { "location.address": { $in: locs } }
      ];
    } else if (nearLandmark) {
      query["location.address"] = new RegExp(nearLandmark, "i");
    }

    // 2. Exclusion Negation engine
    if (exclude) {
       try {
           const exclObj = JSON.parse(exclude);
           // Translate Exclusion Schema bounds directly
           if (exclObj.propertyType) query.propertyType = { $ne: exclObj.propertyType };
           
           if (exclObj.sharing) {
               // Must exclude anything matching sharing limits
               if (!query["pgDetails.rooms"]) query["pgDetails.rooms"] = {};
               query["pgDetails.rooms"].$not = { $elemMatch: { sharing: { $exists: true } } };
           }
       } catch(e) { console.warn("Failed to parse Exclude object", e); }
    }

    // 3. Property Type Bounding (Accepts Arrays "pg,apartment")
    if (propertyType) {
        if (!query.propertyType) { // Avoid over-writing the $ne block
            const types = propertyType.split(',');
            query.propertyType = types.length === 1 ? types[0] : { $in: types };
        }
    }

    // 4. Price Elasticity Engine
    if (maxPrice || minPrice || priceCategory) {
      query.rent = {};
      if (maxPrice) query.rent.$lte = Number(maxPrice);
      if (minPrice) query.rent.$gte = Number(minPrice);
      
      if (priceCategory === 'low') query.rent.$lte = 10000;
      if (priceCategory === 'high') query.rent.$gte = 25000;
      
      // Cleanup empty rent bound if no numerical overlaps hit
      if (Object.keys(query.rent).length === 0) delete query.rent;
    }

    // 5. Gender Targeting
    if (gender) query["pgDetails.gender"] = gender;

    // 6. Sharing Structure (Also accepts nested arrays "single,double" encoded as "1,2")
    if (sharing) {
      const shareTypes = sharing.split(',').map(s => Number(s));
      query["pgDetails.rooms"] = {
        $elemMatch: {
          sharing: shareTypes.length === 1 ? shareTypes[0] : { $in: shareTypes }
        }
      };
      if (availableBeds === 'true') {
         query["pgDetails.rooms"].$elemMatch.availableBeds = { $gt: 0 };
      }
    } else if (availableBeds === 'true') {
        query["pgDetails.rooms"] = { $elemMatch: { availableBeds: { $gt: 0 } } };
    }

    // 7. Core Apartments Bounding
    if (bhkType) query.bhkType = new RegExp(bhkType, "i");
    
    // 8. Family vs Bachelors
    if (bachelorAllowed !== undefined && bachelorAllowed !== "false") {
        query["preferences.bachelorAllowed"] = true;
    } else if (bachelorAllowed === "false") {
        query["preferences.bachelorAllowed"] = false;
    }

    // 9. Furnishing State
    if (furnishing) query.furnishing = furnishing;

    // 10. Availability & Temporal bounds
    if (available === 'true') query.moveInReady = true;

    // 11. Multi-Condition Amenity Engine ($all requires all tags)
    if (amenities) {
        const reqAmens = amenities.split(',');
        query.amenities = { $all: reqAmens };
    }

    // 12. Capacity Overrides
    if (requiredCapacity) query["preferences.maxOccupants"] = { $gte: Number(requiredCapacity) };
    
    // 13. Security Bounding
    if (isVerified === 'true') query.isVerified = true;

    // 14. Room Counts
    if (roomCount) query["pgDetails.totalRooms"] = { $gte: Number(roomCount) };

    // Sorting Output Matrices
    let sortObj = {};
    if (sort === "price_low") sortObj.rent = 1;
    else if (sort === "price_high") sortObj.rent = -1;
    else if (sort === "latest") sortObj.createdAt = -1;
    
    // Fallback relevance
    if (!lat || !lng) {
       if (!Object.keys(sortObj).length) sortObj.matchScore = -1; 
    }

    const results = await Property.find(query).sort(sortObj).limit(40);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Advanced Engine Query Syntax Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
