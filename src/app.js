const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// app.use((req, res, next) => {
//   if (req.secure) {
//     next();
//   } else {
//     const httpsHost = req.headers.host.replace(/:\d+$/, "");
//     console.log(httpsHost);
//     const httpsUrl = `https://${httpsHost}${req.url}`;
//     console.log(httpsUrl);
//     res.redirect(301, httpsUrl);
//   }
// });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mainRouter = require("./routes/index");

app.use(express.static(path.join(__dirname, "../../client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

app.use("/api", mainRouter);

app.use((err, req, res, next) => {
  res.statusCode = err.statusCode || 500;
  res.send(err.message);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

module.exports = app;
