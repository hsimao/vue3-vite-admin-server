const jwt = require('jsonwebtoken')

const createToken = (data) => {
  return jwt.sign({ data }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const jwtVerify = (token) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = {
  createToken,
  jwtVerify,
}
