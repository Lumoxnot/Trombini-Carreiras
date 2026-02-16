import Joi from 'joi';

/**
 * Middleware genérico para validação com Joi
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors
      });
    }

    req.validatedData = value;
    next();
  };
};

// Schemas de validação

export const userProfileSchema = Joi.object({
  user_type: Joi.string().valid('candidate', 'company').required(),
  full_name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null).optional()
});

export const resumeSchema = Joi.object({
  full_name: Joi.string().min(3).max(255).required(),
  age: Joi.number().integer().min(16).max(100).required(),
  objective: Joi.string().min(10).max(1200).required(),
  education: Joi.string().min(10).required(),
  experience: Joi.string().min(10).required(),
  skills: Joi.string().min(5).required(),
  contact_email: Joi.string().email().required(),
  contact_phone: Joi.string().required(),
  is_published: Joi.boolean().default(false)
});

export const jobPostingSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(20).required(),
  requirements: Joi.string().allow('', null).optional(),
  skills_required: Joi.string().allow('', null).optional(),
  location: Joi.string().allow('', null).optional(),
  contact_info: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().default(true)
});

export const applicationSchema = Joi.object({
  job_id: Joi.number().integer().positive().required(),
  resume_id: Joi.number().integer().positive().required()
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required()
});
