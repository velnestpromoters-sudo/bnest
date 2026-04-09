const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    console.log("---- DEBUG START ----");

    const all = await Property.find();

    console.log("TOTAL PROPERTIES:", all.length);

    if (all.length > 0) {
      console.log("SAMPLE PROPERTY:", JSON.stringify(all[0], null, 2));
    }

    return res.json({
      total: all.length,
      sample: all[0] || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
