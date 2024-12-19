import Joi from 'joi';

export const validateAuthentication = Joi.object({
  username: Joi.string().alphanum().length(6).required().messages({
    'string.empty': 'Username is required.',
    'string.alphanum': 'Username can only contain letters and numbers.',
    'string.length': 'Username must be exactly 6 characters long.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters long.',
  }),
});

export default validateAuthentication;
