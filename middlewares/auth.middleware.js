const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; //BEARER SFSDFSD
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.userId = decodedToken.id;
    req.role = decodedToken.role;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(`req.role ${req.role}`);
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: "this action require admin role" });
    }
    next();
  };
};
