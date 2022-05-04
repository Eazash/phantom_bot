import * as Joi from 'joi';

const telegramConfigSchema = {
  BOT_KEY: Joi.string().required(),
  TELEGRAM_API_URL: Joi.string().default('https://api.telegram.org/bot'),
};

export default telegramConfigSchema;
