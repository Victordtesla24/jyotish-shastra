import Joi from 'joi';

export default function validation(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details });
    }
    next();
  };
};
