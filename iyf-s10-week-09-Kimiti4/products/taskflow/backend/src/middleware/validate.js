const { validationResult } = require('express-validator');

function validate(validations) {
  return async (req, res, next) => {
    for (const v of validations) {
      await v.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extracted = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: extracted[0], code: 'VALIDATION_ERROR', details: extracted });
  };
}

module.exports = validate;
