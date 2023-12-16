const jwt = require("jsonwebtoken");

const generateToken = (id: string, email_id: string) => {
  return jwt.sign({ id, email_id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
