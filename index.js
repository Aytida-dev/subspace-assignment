const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const { apiRouter } = require("./routes/apiRouter");

require("dotenv").config;
const port = process.env.PORT || 5000;

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send({
    message: "server running smoothly",
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
