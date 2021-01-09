const app = require("./app");
const debug = require("debug")("node-angular");
const http = require("http");

const normalizePort = (val) => { 
  const port = parseInt(val, 10); 

  // If not a number 123 & "123" inNaN returns false
  if (isNaN(port)) {
    // named pipe "mike"
    return val;
  }

  // If a positive number
  if (port >= 0) {
    // port number 123
    return port;
  }

  return false;
};

const onError = (error) => {

  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {

    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;

    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;

    default:
      throw error;
  }
};

const onListening = () => {

  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;

  debug("Listening on " + bind);

};

// =============================================================================

const port = normalizePort(process.env.PORT || "3000");

app.set("port", port)

const server = http.createServer(app);

//---- new start

server.on("error", onError);
server.on("listening", onListening);

//---- new end

server.listen(port);
