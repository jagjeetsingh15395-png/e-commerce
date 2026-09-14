const jwt = require("jsonwebtoken");
const AdminSignup = require("../models/admin.signup");

function extractToken(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await AdminSignup.findById(decoded.id);

    if (!adminUser) {
      return res.status(401).json({ message: "Unauthorized - Invalid admin" });
    }

    req.token = token;
    req.admin = adminUser;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ message: "Invalid token - " + error.message });
  }
};

module.exports = authMiddleware;
