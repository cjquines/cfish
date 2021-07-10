import React from "react";

import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Config {
  export type Props = {
    client: Client;
  };
}

export class Config extends React.Component<Config.Props> {
  renderOption<K extends keyof C.Rules>(
    label: string,
    key: K,
    val: C.Rules[K],
    title: string
  ) {
    const { client } = this.props;
    const { engine } = client;

    const selected = engine.rules[key] === val;
    const onClick = (e) => {
      client.setRules({
        ...engine.rules,
        [key]: val,
      });
    };

    return (
      <button disabled={selected} onClick={onClick} title={title}>
        {label}
      </button>
    );
  }

  render() {
    const { client } = this.props;
    const { engine } = client;
    const isHost = engine.identity === engine.host;

    return (
      <div className={`config ${isHost ? "" : "disabled"}`}>
        <div className="option">
          <div className="title">ask for<br/>own card</div>
          {this.renderOption(
            "no",
            "bluff",
            C.BluffRule.NO,
            "people cannot ask for cards they own"
          )}
          {this.renderOption(
            "yes",
            "bluff",
            C.BluffRule.YES,
            "people can ask for cards they own"
          )}
        </div>
        <div className="option">
          <div className="title">declare</div>
          {this.renderOption(
            "any time",
            "declare",
            C.DeclareRule.DURING_ASK,
            "people can declare any time, even not during their turn"
          )}
          {this.renderOption(
            "during turn",
            "declare",
            C.DeclareRule.DURING_TURN,
            "people can only declare during their turn"
          )}
        </div>
        <div className="option">
          <div className="title">hand size</div>
          {this.renderOption(
            "public",
            "handSize",
            C.HandSizeRule.PUBLIC,
            "everyone knows how many cards people have"
          )}
          {this.renderOption(
            "private",
            "handSize",
            C.HandSizeRule.SECRET,
            "people only know whether or not someone has cards"
          )}
        </div>
        <div className="option">
          <div className="title">log</div>
          {this.renderOption(
            "last action",
            "log",
            C.LogRule.LAST_ACTION,
            "everyone can see the last action"
          )}
          {this.renderOption(
            "last two",
            "log",
            C.LogRule.LAST_TWO,
            "everyone can see the last two actions"
          )}
          {this.renderOption(
            "all actions",
            "log",
            C.LogRule.EVERYTHING,
            "everyone can see the history of every action"
          )}
        </div>
      </div>
    );
  }
}
