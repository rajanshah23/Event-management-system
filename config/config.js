const dotenv = require("dotenv");
dotenv.config();

const envConfig = {
  portNumber: process.env.PORT,
};
module.exports = envConfig;
