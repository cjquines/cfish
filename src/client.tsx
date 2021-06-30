import React from "react";
import { render } from "react-dom";
import { hot } from "react-hot-loader/root";
import socketIOClient from "socket.io-client";

import { App } from "components/App";

import "styles/style.scss";

const isDev = process.env.NODE_ENV !== "production";
const port = isDev ? 8080 : window.location.port;
const url = `${window.location.hostname}:${port}`;
const Main = hot(App);

render(<Main url={url} />, document.getElementById("app"));
