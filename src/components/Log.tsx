import React from "react";

import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace LogItem {
  export type Props = {
    item: string;
  };
}

export class LogItem extends React.Component<LogItem.Props> {
  render() {
    const { item } = this.props;
    const split = item.split(" ");
    const redJoker =
      split[split.length - 1] === "Joker" && split[split.length - 2] === "Red";
    const redSuit = ["♦", "♥"].some(
      (suit) => suit === split[split.length - 1].slice(-1)
    );
    const n = redJoker ? 2 : redSuit ? 1 : 0;
    const rem = split.splice(-n, n);
    return (
      <span>
        {split.join(" ")}
        {n ? <span style={{ color: "red" }}> {rem.join(" ")}</span> : null}
      </span>
    );
  }
}

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
            log.map((item, i) => (
              <li key={i}>
                <LogItem item={item} />
              </li>
            ))
          ) : last ? (
            <li>
              <LogItem item={last} />
            </li>
          ) : null}
        </ul>
      </div>
    );
  }
}
