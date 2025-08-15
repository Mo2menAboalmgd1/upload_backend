const cors = require("cors");
const { ALLOWED_ORIGINS } = require("../config/env");

const origin = (origin, cb) => {
  if (!origin) return cb(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
  cb(new Error("not valid origin"));
};

const myCORS = () => {
  return cors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
};

const optionsCORS = () => {
  return (req, res, next) => {
    if (req.method === "OPTIONS") return myCORS()(req, res, next);
    next();
  };
};

module.exports = {
  myCORS,
  optionsCORS,
};
