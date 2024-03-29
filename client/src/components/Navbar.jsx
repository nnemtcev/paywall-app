import React from "react";
import { withRouter, Link } from "react-router-dom";
import AppBar from "material-ui/AppBar";
import FlatButton from "material-ui/FlatButton";
import NotificationBadge from "./NotificationBadge.jsx";
import MessagesBadge from "./MessagesBadge.jsx";

const style = {
  nav: {
    background: "#3D95CE",
    display: "flex",
  },
  left: {
    display: "none",
  },
  log_out: {
    color: "#fff",
    textDecoration: "underline",
  },
};

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: this.props.isLoggedIn,
    };
  }

  logOutAndRedirect() {
    this.props.logUserOut();
    this.props.history.push("/login");
  }

  render() {
    return (
      <AppBar
        className="navbar"
        style={style.nav}
        title={
          <div className="navbar-logo">
            <Link to="/">
              <span>Paywall</span>
            </Link>
          </div>
        }
        iconStyleLeft={style.left}
        iconElementRight={
          <div>
            {this.props.isLoggedIn && (
              <div>
                <NotificationBadge className="notification-badge" />

                <MessagesBadge newMessages={this.props.newMessages} />

                <FlatButton
                  style={style.log_out}
                  hoverColor="#03A9F4"
                  className="navbar-logout"
                  onClick={this.logOutAndRedirect.bind(this)}
                  label="Log Out"
                />
              </div>
            )}
          </div>
        }
      />
    );
  }
}

export default withRouter(Navbar);
