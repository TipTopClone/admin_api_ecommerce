import Joi from 'joi';
import { responder } from './response.js';

//constants
const SHORTSTR = Joi.string().max(100).allow(null, '');
const SHORTSTRREQ = SHORTSTR.required();
const LONGSTR = Joi.string().max(500).allow(null, '');
const LONGSTRREQ = LONGSTR.required();
const EMAIL = Joi.string()
  .email({ maxDomainSegments: 2 })
  .max(100)
  .allow(null, '');
const EMAILREQ = EMAIL.required();

const joiValidator = ({ schema, req, res, next }) => {
  try {
    const { error } = schema.validate(req.body);

    if (error) {
      //   const responder = responseClient({ res });
      return responder.ERROR({ res, message: error.message });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const newAdminValidation = (req, res, next) => {
  const schema = Joi.object({
    fName: SHORTSTRREQ,
    lName: SHORTSTRREQ,
    email: EMAILREQ,
    phone: SHORTSTR,
    address: SHORTSTR,
    password: SHORTSTR,
  });
  joiValidator({ schema, req, res, next });
};
