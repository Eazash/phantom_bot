import * as Joi from 'joi';

const databseConfigSchema = {
  DATABASE_URL: Joi.string().required(),
};

export default databseConfigSchema;
