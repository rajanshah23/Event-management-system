const dotenv = require("dotenv");
dotenv.config();

const envConfig = {
  portNumber: process.env.PORT,
  mongoUrl:process.env.MONGO_URI
};
module.exports = envConfig;
