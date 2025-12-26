import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./header.css";

class Header extends Component {
  state = { contactInfoClassname: "contactInfoBlurred" };

  // Reveal contact info
  onContactInfoClick = (event) => {
    const { getLocaleString } = this.props;
    event.preventDefault();
    if (window.confirm(getLocaleString("FAQ/HAVE-YOU-READ"))) {
      alert(getLocaleString("FAQ/HELP-IN-ENGLISH"));
      this.setState({ contactInfoClassname: "contactInfo" });
    }
  };

  render() {
    const { contactInfoClassname } = this.state;
    const { getLocaleString } = this.props;
    return (
      <div className="header">
      </div>
    );
  }
}

export default Header;
