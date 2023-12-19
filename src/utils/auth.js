const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const accessToken = req.header("Authorization");
  if (!accessToken)
    return res.status(403).json({ message: "No token found please login" });
  return jwt.verify(
    accessToken,
    process.env.JWT_SECRET,
    async (err, result) => {
      if (err)
        return res.status(403).json({ message: "Invalid authorization" });
      req.user = result.id;
      
      next();
    }
  );
};

module.exports = auth;
