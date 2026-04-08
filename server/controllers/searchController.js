const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      location,
      maxPrice,
      minPrice,
      propertyType,
      gender,
      sharing,
      bhkType,
      bachelorAllowed,
      amenities,
      sort
    } = req.query;

    let query = {
      isActive: true
    };

    if (location) {
      query["location.area"] = new RegExp(location, "i");
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (maxPrice || minPrice) {
      query.rent = {};
      if (maxPrice) query.rent.$lte = Number(maxPrice);
      if (minPrice) query.rent.$gte = Number(minPrice);
    }

    if (propertyType === "pg") {
      if (gender) query["pgDetails.gender"] = gender;

      if (sharing) {
        query["pgDetails.rooms.sharing"] = Number(sharing);
        query["pgDetails.rooms.availableBeds"] = { $gt: 0 };
      }
    }

    if (propertyType === "apartment") {
      if (bhkType) query.bhkType = new RegExp(bhkType, "i");
      if (bachelorAllowed !== undefined && bachelorAllowed !== "false") {
         query["preferences.bachelorAllowed"] = true;
      }
    }

    let sortObj = {};
    if (sort === "price_low") sortObj.rent = 1;
    else if (sort === "price_high") sortObj.rent = -1;
    else if (sort === "latest") sortObj.createdAt = -1;
    else sortObj.matchScore = -1; // Default to best match config

    const results = await Property.find(query).sort(sortObj).limit(20);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
