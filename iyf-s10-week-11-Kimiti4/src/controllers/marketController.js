/**
 * 🔹 Market Controller (FarmLink price transparency)
 *
 * R3 [P1-2]: the previous implementation returned hardcoded in-memory prices
 * from data/store.js as if they were live market data. Per the MOCK DATA
 * RULE that behavior is removed. Until a real price feed exists, the
 * endpoint truthfully reports UNAVAILABLE (501).
 */
const asyncHandler = require('../utils/asyncHandler');

// GET farm produce prices — explicitly unavailable (no authoritative source in R3)
const getPrices = asyncHandler(async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Market prices are not available',
    code: 'MARKET_UNAVAILABLE'
  });
});

module.exports = {
  getPrices
};
