/**
 * 🔹 Market Controller (FarmLink price transparency)
 */
const store = require('../data/store');
const asyncHandler = require('../utils/asyncHandler');

// GET farm produce prices
const getPrices = asyncHandler(async (req, res) => {
  const { crop, county } = req.query;

  let result = [...store.marketPrices];

  if (crop) {
    result = result.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
  }
  if (county) {
    result = result.filter(p => p.county.toLowerCase() === county.toLowerCase());
  }

  res.json({
    success: true,
    count: result.length,
    note: 'Farmers: Compare farm gate vs market prices to negotiate better',
    data: result
  });
});

module.exports = {
  getPrices
};
