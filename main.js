const express = require("express");
const helmet = require("helmet");
const upload = require("./config/multer");
const hpp = require("hpp");
const { myCORS, optionsCORS } = require("./middlewares/cors");

const uploadRouter = require("./routers/upload.router");
const errorHandler = require("./middlewares/errorHandler");
const db = require("./config/db")
const { PORT } = require("./config/env");

const app = express();

app.use(helmet());
app.use(hpp());
app.use(myCORS());
app.use(optionsCORS());

app.use("/upload", upload.array("files", 5), uploadRouter);

app.get("/health", async (req, res, next) => {
  try {
    const r = await db.query("SELECT 1 as ok;");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler());

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
