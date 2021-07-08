import React from "react";

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
    const { log } = client;

    return (
      <div className={`log ${active ? "active" : ""}`}>
        <ul>
          {log.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
}
