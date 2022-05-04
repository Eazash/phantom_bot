import * as Joi from 'joi';

const appConfigSchema = {
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid('development', 'production').optional(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
};

export default appConfigSchema;
