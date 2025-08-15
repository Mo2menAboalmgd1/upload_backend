const errorHandler = () => {
  return (err, _req, res, next) => {
    if (err.message === "not valid origin") {
      err.code = 403;
      return res.status(403).json({
        error: err.message,
        status: err.code,
      });
    }
    next();
  };
};

module.exports = errorHandler;
