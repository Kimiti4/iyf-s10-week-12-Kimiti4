/**
 * 🔹 Uploads Controller - image uploads stored under public/uploads/.
 * No new dependencies: base64 JSON body (10mb app limit) + crypto + fs.
 * Files are content-addressed by random UUID; only the extension is
 * client-influenced and it is mapped from an allowlisted MIME type.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const ALLOWED_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};
// 4MB raw cap (base64 inflates ~33%; stays under the 10mb JSON limit)
const MAX_BYTES = 4 * 1024 * 1024;

function uploadsDir() {
  const dir = path.join(__dirname, '..', '..', 'public', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// POST /api/uploads - authenticated image upload, returns public URL
const uploadImage = asyncHandler(async (req, res) => {
  const { filename, mimeType, data } = req.body || {};
  if (!data || typeof data !== 'string') {
    throw new ApiError('Image data (base64) is required', 400);
  }
  const ext = ALLOWED_MIME[mimeType];
  if (!ext) {
    throw new ApiError('Unsupported image type. Allowed: jpeg, png, gif, webp', 400);
  }
  // Strip optional data-URL prefix
  const base64 = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data;
  let buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch {
    throw new ApiError('Invalid base64 image data', 400);
  }
  if (buffer.length === 0) {
    throw new ApiError('Empty image data', 400);
  }
  if (buffer.length > MAX_BYTES) {
    throw new ApiError('Image too large (max 4MB)', 400);
  }
  // Magic-byte verification so the extension always matches real content
  const magic = buffer.subarray(0, 12);
  const isJpeg = magic[0] === 0xFF && magic[1] === 0xD8 && magic[2] === 0xFF;
  const isPng = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47;
  const isGif = buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a';
  const isWebp = buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  const matches = (mimeType === 'image/jpeg' && isJpeg) ||
    (mimeType === 'image/png' && isPng) ||
    (mimeType === 'image/gif' && isGif) ||
    (mimeType === 'image/webp' && isWebp);
  if (!matches) {
    throw new ApiError('Image content does not match declared type', 400);
  }
  void filename; // client-provided names are never used on disk
  const stored = `${crypto.randomUUID()}${ext}`;
  await fs.promises.writeFile(path.join(uploadsDir(), stored), buffer);
  res.status(201).json({ success: true, data: { url: `/uploads/${stored}` } });
});

module.exports = { uploadImage };
