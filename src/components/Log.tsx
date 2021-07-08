import React from "react";

import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Log {
  export type Props = {
    active: boolean;
    client: Client;
  };
}

export class Log extends React.Component<Log.Props> {
  render() {
    const { active, client } = this.props;
    const { log, engine } = client;
    const last = log?.[log.length - 1];

    return (
      <div className={`log ${active ? "active" : ""}`}>
        <ul>
          {engine.rules.log === C.LogRule.EVERYTHING ? (
            log.map((item, i) => <li key={i}>{item}</li>)
          ) : last ? (
            <li>{last}</li>
          ) : null}
        </ul>
      </div>
    );
  }
}
