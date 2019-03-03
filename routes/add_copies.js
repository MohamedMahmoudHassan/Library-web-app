/* eslint-disable no-underscore-dangle */
const express = require('express');
// eslint-disable-next-line no-unused-vars
const valDebugger = require('debug')('app:startup');
const { AvailCopies, validate, fkValidate } = require('../model/available_copies');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Enter copies\' information');
});

// eslint-disable-next-line consistent-return
router.post('/', async (req, res) => {
  let { error } = validate(req.body);
  if (!error) error = await fkValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const CopyExist = await AvailCopies.findOne({
    book_id: req.body.book_id,
    branch_id: req.body.branch_id,
  });

  if (CopyExist) {
    const result = await AvailCopies.findByIdAndUpdate(CopyExist._id,
      { $inc: { avail_buy: req.body.avail_buy, avail_bro: req.body.avail_bro } },
      { new: true });

    res.send(result);
  } else {
    const copy = new AvailCopies(req.body);
    const result = await copy.save();

    res.send(result);
  }
});

module.exports = router;
