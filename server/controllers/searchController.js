const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const { queryText = "", lat, lng } = req.query;

    let query = { isActive: true };
    const qStr = queryText.toLowerCase();

    // 1. Basic Parameter Filters (Since NLP hook is erased, we apply static checks)
    if (qStr.match(/\bpg\b|\bhostel\b|\bboys\b|\bgirls\b/)) { query.propertyType = 'pg'; }
    if (qStr.match(/\bboys\b/)) { query["pgDetails.gender"] = 'boys'; }
    if (qStr.match(/\bgirls\b/)) { query["pgDetails.gender"] = 'girls'; }

    let results = [];

    // 2. Fundamental Spatial Search (Overrides entire text reliance)
    if (lat && lng && lat !== 'null' && lng !== 'null') {
      const numericLat = Number(lat);
      const numericLng = Number(lng);

      // Attempt exactly 3 KM cutoff per Architecture rule
      query["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [numericLng, numericLat] },
          $maxDistance: 3000 // 3KM
        }
      };

      results = await Property.find(query).limit(20);

      // 3. Fallback: Check 5KM if 3KM yields 0 outcomes
      if (results.length === 0) {
        query["location.coordinates"].$near.$maxDistance = 5000; // 5KM
        results = await Property.find(query).limit(20);
      }
    } 
    // 4. Ultimate String Fallback (if user typed nonsense and OSM broke entirely)
    else {
      if (queryText) {
        query.$or = [
          { "location.area": new RegExp(queryText, "i") },
          { title: new RegExp(queryText, "i") }
        ];
        results = await Property.find(query).limit(20);
      } else {
        results = await Property.find(query).limit(20);
      }
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
