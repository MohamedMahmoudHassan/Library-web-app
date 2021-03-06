const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

function validationErr(msg) {
  return { details: [{ message: msg }] };
}

function dateAfter(time, days) {
  return time + days * 86400000;
}


function isValId(body) {
  const Schema = {
    id: Joi.objectId(),
  };
  return Joi.validate(body, Schema);
}

module.exports.validationErr = validationErr;
module.exports.isValId = isValId;
module.exports.dateAfter = dateAfter;
