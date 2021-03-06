const decode = require('./decode');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (token) {
    const decoded = decode(token);
    if (decoded.status !== -1 && decoded.type !== 3) return res.status(400).send('You are already logged in.');
    return res.status(400).send('Invalid token');
  }
  next();
};
