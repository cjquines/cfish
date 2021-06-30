const express = require("express");
const app = express();
const Server = require("lib/server").Server;

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  const webpack = require("webpack");
  const config = require("../webpack.config");
  const compiler = webpack(config);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      publicPath: config.output.publicPath,
    })
  );
  app.use(require("webpack-hot-middleware")(compiler));
}

app.use(express.static("dist"));

const http = require("http").createServer(app);
const server = new Server(http);

const port = process.env.PORT || 8080;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
