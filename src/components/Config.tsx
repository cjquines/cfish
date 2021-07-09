import React from "react";

import { CFish } from "lib/cfish";
import { Client } from "lib/client";

export namespace Config {
  export type Props = {
    client: Client;
  };
}

export class Config extends React.Component<Config.Props> {
  renderOption<K extends keyof CFish.Rules>(
    label: string,
    key: K,
    val: CFish.Rules[K],
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

    return (
      <div className="config">
        <div className="option">
          <div className="title">bluff</div>
          {this.renderOption(
            "no",
            "bluff",
            CFish.BluffRule.NO,
            "people cannot ask for cards they own"
          )}
          {this.renderOption(
            "yes",
            "bluff",
            CFish.BluffRule.YES,
            "people can ask for cards they own"
          )}
        </div>
        <div className="option">
          <div className="title">declare</div>
          {this.renderOption(
            "any time",
            "declare",
            CFish.DeclareRule.DURING_ASK,
            "people can declare any time, even not during their turn"
          )}
          {this.renderOption(
            "during turn",
            "declare",
            CFish.DeclareRule.DURING_TURN,
            "people can only declare during their turn"
          )}
        </div>
        <div className="option">
          <div className="title">hand size</div>
          {this.renderOption(
            "public",
            "handSize",
            CFish.HandSizeRule.PUBLIC,
            "everyone knows how many cards people have"
          )}
          {this.renderOption(
            "private",
            "handSize",
            CFish.HandSizeRule.SECRET,
            "people only know whether or not someone has cards"
          )}
        </div>
        <div className="option">
          <div className="title">log</div>
          {this.renderOption(
            "last action",
            "log",
            CFish.LogRule.LAST_ACTION,
            "everyone can see the last action"
          )}
          {this.renderOption(
            "all actions",
            "log",
            CFish.LogRule.EVERYTHING,
            "everyone can see the history of every action"
          )}
        </div>
      </div>
    );
  }
}
