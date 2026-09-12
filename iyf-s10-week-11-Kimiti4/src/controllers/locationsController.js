/**
 * 🔹 Locations Controller
 *
 * R3 [P1-1]: the previous implementation returned hardcoded in-memory data
 * from data/store.js as if it were authoritative location data. Per the
 * MOCK DATA RULE that behavior is removed. Until a real location source
 * exists, the endpoint truthfully reports UNAVAILABLE (501).
 */
const asyncHandler = require('../utils/asyncHandler');

// GET locations — explicitly unavailable (no authoritative source in R3)
const getAllLocations = asyncHandler(async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Location directory is not available',
    code: 'LOCATIONS_UNAVAILABLE'
  });
});

module.exports = {
  getAllLocations
};
