import React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";

export namespace Splash {
  export type Props = RouteComponentProps;

  export type State = {
    room: string;
  };
}

class Splash extends React.Component<Splash.Props, Splash.State> {
  constructor(props) {
    super(props);

    this.state = {
      room: "",
    };
  }

  submit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.history.push(`/room/${this.state.room}`);
  }

  handleChangeRoom(e) {
    this.setState({ room: e.target.value });
  }

  render() {
    return (
      <div className="splash">
        <p><b>cfish</b> · <a href="https://www.pagat.com/quartet/literature.html">rules</a></p>
        <form onSubmit={(e) => this.submit(e)}>
          <span>
            <label htmlFor="room">room:</label>
            <input
              id="room"
              onChange={(e) => this.handleChangeRoom(e)}
              type="text"
              value={this.state.room}
            />
          </span>
          <button type="submit">go!</button>
        </form>
        <p>
          by <a href="https://cjquines.com/">cjquines</a> ·{" "}
          <a href="https://github.com/cjquines/cfish/">github</a>
        </p>
      </div>
    );
  }
}

export default withRouter(Splash);
