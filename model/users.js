/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const jwt = require('jsonwebtoken');
const config = require('config');
// eslint-disable-next-line no-unused-vars
const valDebugger = require('debug')('app:validation');
const customers = require('./customers');
const clerks = require('./clerks');
const admins = require('./admins');

const userTypes = [customers, clerks, admins];

function validate(body) {
  const Schema = {
    fName: Joi.string().regex(/^[A-Z][a-z]{1,15}$/).required(),
    lName: Joi.string().regex(/^[A-Z][a-z]{1,15}$/).required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().regex(/^[\w@-]{8,20}$/).required(),
    type: Joi.number().required(),
    branch_id: Joi.objectId(),
  };
  return Joi.validate(body, Schema);
}

function loginValidate(body) {
  const Schema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().regex(/^[\w@-]{8,20}$/).required(),
  };
  return Joi.validate(body, Schema);
}

function dateAfter(time, days) {
  return time + days * 8640000;
}

const userSchema = new mongoose.Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: Number, required: true },
});

// eslint-disable-next-line func-names
userSchema.methods.generateAuthToken = function () {
  // eslint-disable-next-line no-underscore-dangle
  return jwt.sign({ id: this._id, type: this.type, logoutDate: dateAfter(Date.now(), 7) }, config.get('jwtPrivateKey'));
};

const User = mongoose.model('User', userSchema);

async function createUser(body) {
  // Transaction
  let user = new User(body);
  user = await user.save();

  const customBody = { user_id: `${user._id}` };
  if (body.branch_id)customBody.branch_id = body.branch_id;

  let { error } = userTypes[body.type - 1].validate(customBody);
  if (!error && body.type === 2)error = await userTypes[1].fkValidate(customBody);

  if (error) {
    await User.findByIdAndDelete(user._id);
    return error;
  }

  const userTyped = new userTypes[body.type - 1].User(customBody);
  await userTyped.save();

  return user;
}

module.exports.validate = validate;
module.exports.loginValidate = loginValidate;
module.exports.createUser = createUser;
module.exports.User = User;
