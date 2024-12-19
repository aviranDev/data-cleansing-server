import Joi from 'joi';

export const resetPasswordValidation = Joi.object({
  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'string.max': 'Password cannot exceed 255 characters.',
    'any.required': 'Password is required.',
    'string.empty': 'Password should not be empty.',
  }),
  confirmPassword: Joi.string().min(6).max(255).required().messages({
    'string.min': 'confirm Password must be at least 6 characters long.',
    'string.max': 'confirm Password cannot exceed 255 characters.',
    'any.required': 'Password is required.',
    'string.empty': 'confirmPassword should not be empty.',
  }),
});

export default resetPasswordValidation;
