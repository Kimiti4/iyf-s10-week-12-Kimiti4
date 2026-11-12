/**
 * Consistent success / failure helpers for controllers
 */

function ok(res, data = null, meta = {}) {
  return res.status(200).json({
    success: true,
    data,
    ...meta,
  });
}

function created(res, data = null, meta = {}) {
  return res.status(201).json({
    success: true,
    data,
    ...meta,
  });
}

function noContent(res) {
  return res.status(204).send();
}

module.exports = { ok, created, noContent };
