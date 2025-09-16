const app = require("./src/app");
const envConfig = require("./config/config");
const connectDB = require("./database/connection");

function startServer() {
  connectDB();
  const port = envConfig.portNumber;
  app.listen(port, function () {
    console.log(`Server has started at port:http://localhost:${port}`);
  });
}
startServer();
