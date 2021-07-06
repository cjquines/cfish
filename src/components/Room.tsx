import React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import { Action } from "components/Action";
import { CardArea } from "components/CardArea";
import { Players } from "components/Players";
import { Question } from "components/Question";
import { Client } from "lib/client";

export namespace Room {
  export type Match = {
    room: string;
  };

  export type Props = RouteComponentProps<Match> & {
    url: string;
  };

  export type State = {
    client: Client | null;
    name: string;
    room: string;
  };
}

class Room extends React.Component<Room.Props, Room.State> {
  constructor(props) {
    super(props);

    this.state = {
      client: null,
      name: window.prompt("enter your name") || "no name",
      room: this.props.match.params.room,
    };
  }

  componentDidMount() {
    if (this.state.client !== null) return;
    const client = new Client(this.props.url, this.state.room, this.state.name);
    client.onUpdate = (client: Client) => this.setState({ client });
    client.connect();
    this.setState({ client });
  }

  render() {
    const { client } = this.state;
    if (!client?.engine) {
      return <div className="game">loading...</div>;
    }

    const { engine } = client;

    return (
      <div className="game">
        <div className="table">
          <Players client={client} />
          <Question client={client} />
        </div>
        <Action client={client} />
        <CardArea client={client} />
      </div>
    );
  }
}

export default withRouter(Room);
