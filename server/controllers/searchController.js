const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      queryText = "",
      lat,
      lng,
      radius = 5000,
      minPrice,
      maxPrice,
      propertyType,
      gender,
      sharing,
      bhkType,
      amenities,
      furnishing,
      availability,
      bachelorAllowed
    } = req.query;

    const pipeline = [];

    // ATLAS SEARCH STAGE
    const searchStage = {
      $search: {
        index: "property_search",
        compound: {
          must: [],
          filter: []
        }
      }
    };

    if (queryText) {
      searchStage.$search.compound.must.push({
        text: {
          query: queryText,
          path: ["title", "description", "location.area", "location.address"],
          fuzzy: { maxEdits: 2 }
        }
      });
    }

    // GEO FILTER
    if (lat && lng) {
      searchStage.$search.compound.filter.push({
        geoWithin: {
          circle: {
            center: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)]
            },
            radius: Number(radius)
          },
          path: "location.coordinates"
        }
      });
    }

    // PRICE FILTER
    if (minPrice || maxPrice) {
      searchStage.$search.compound.filter.push({
        range: {
          path: "rent",
          gte: minPrice ? Number(minPrice) : 0,
          lte: maxPrice ? Number(maxPrice) : 1000000
        }
      });
    }

    // PROPERTY TYPE
    if (propertyType) {
      searchStage.$search.compound.filter.push({
        text: {
          path: "propertyType",
          query: propertyType
        }
      });
    }

    // PG FILTERS
    if (propertyType === "pg" || propertyType?.includes("pg")) {
      if (gender) {
        searchStage.$search.compound.filter.push({
          text: {
            path: "pgDetails.gender",
            query: gender
          }
        });
      }

      if (sharing) {
        searchStage.$search.compound.filter.push({
          equals: {
            path: "pgDetails.rooms.sharing",
            value: Number(sharing)
          }
        });
      }
    }

    // BHK
    if (bhkType) {
      searchStage.$search.compound.filter.push({
        text: {
          path: "bhkType",
          query: bhkType
        }
      });
    }

    // AMENITIES
    if (amenities) {
      searchStage.$search.compound.filter.push({
        text: {
          query: amenities.split(","),
          path: "amenities"
        }
      });
    }

    // FURNISHING
    if (furnishing) {
      searchStage.$search.compound.filter.push({
        text: {
          path: "furnishing",
          query: furnishing
        }
      });
    }

    // AVAILABILITY
    if (availability) {
      searchStage.$search.compound.filter.push({
        text: {
          path: "availability",
          query: availability
        }
      });
    }
    
    // BACHELORS
    if (bachelorAllowed !== undefined && bachelorAllowed !== "false") {
      searchStage.$search.compound.filter.push({
          equals: {
              path: "preferences.bachelorAllowed",
              value: true
          }
      });
    }

    if (searchStage.$search.compound.must.length === 0) {
      delete searchStage.$search.compound.must;
    }
    if (searchStage.$search.compound.filter.length === 0) {
      delete searchStage.$search.compound.filter;
    }

    if (searchStage.$search.compound.must || searchStage.$search.compound.filter) {
      pipeline.push(searchStage);
    }
    
    pipeline.push({ $match: { isActive: true } });
    pipeline.push({ $limit: 30 });

    const results = await Property.aggregate(pipeline);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Advanced Engine Query Syntax Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
