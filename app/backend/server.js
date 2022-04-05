require("dotenv").config("");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const swaggerUi = require("swagger-ui-express"); //documentação
const swaggerDocument = require("./swaggerdoc.json");

const path = require("path");
const fileUpload = require("express-fileupload");

const config = require("./config");
//const restrictMiddleware = require("./routes/auth/auth");
const app = express();

//Routes
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const statisticsRouter = require("./routes/statistics");
const emailRouter = require("./notifications/email");
const loginRouter = require("./routes/auth/login");
const credentials = require("./routes/auth/credentials");
const raffle = require("./routes/raffle");

const port = config.port || 5000;
const uri = config.atlasUri;

//Middleware
app.use(express.static(path.join(__dirname + "../../build")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(express.json());
app.use(fileUpload());
app.use(cors({ credentials: true, origin: process.env.HOST_ADDRESS })); //USADO NO SWAGGER
app.use(cookieParser());
app.use("/api/auth/login", loginRouter);
app.use("/api/credentials", credentials);
app.use("/api/email", emailRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //SWAGGER
//app.use(restrictMiddleware);
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/raffle", raffle);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.get("*/", function (req, res) {
  res.sendFile(path.join(__dirname + "../../build/index.html"));
});

let server = app.listen(port, function () {
  let host =
    server.address().address === "::" ? "localhost" : server.address().address;
  let port = server.address().port;
  console.log(`Example app listening at http://${host}:${port}`);
});
