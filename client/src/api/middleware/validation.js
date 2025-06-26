const Joi = require('joi');

module.exports = function validation(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details });
    }
    next();
  };
};
