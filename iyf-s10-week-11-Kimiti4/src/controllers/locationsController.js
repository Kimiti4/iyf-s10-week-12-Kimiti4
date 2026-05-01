/**
 * 🔹 Locations Controller
 */
const store = require('../data/store');
const asyncHandler = require('../utils/asyncHandler');

// GET all locations (settlements, counties)
const getAllLocations = asyncHandler(async (req, res) => {
  const { county } = req.query;

  let result = { ...store.locations };

  if (county) {
    result.settlements = result.settlements.filter(s =>
      s.county.toLowerCase() === county.toLowerCase()
    );
  }

  res.json({ success: true, data: result });
});

module.exports = {
  getAllLocations
};
