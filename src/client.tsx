import * as React from "react";
import { render } from "react-dom";
import socketIOClient from "socket.io-client";

import App from "components/App";

const isDev = process.env.NODE_ENV !== "production";
const port = isDev ? 8080 : window.location.port;
const socket = socketIOClient(window.location.hostname + ":" + port);

render(<App />, document.getElementById("app"));
