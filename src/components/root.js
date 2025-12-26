import React, { Component } from "react";

import Header from "./header";
import MapartController from "./mapart/mapartController";

import Locale from "../locale/locale";

import { DISCORD_AUTH_URL, fetchDiscordUser } from "../utils/discordAuth";

import "./root.css";

class Root extends Component {
  state = {
    displayingCorruptedPresetWarning: false,
    displayingEdgeWarning: false,
    isAuthenticating: true,
  };

  constructor(props) {
    super(props);

    // Initial check for global userid
    window.userid = window.userid || null;

    //show warning when using Edge
    if (!(/*@cc_on!@*/ (false || !!document["documentMode"])) && !!window["StyleMedia"]) {
      this.state.displayingEdgeWarning = true;
    }
  }

  async componentDidMount() {
    const hash = window.location.hash;
    let accessToken = localStorage.getItem("discord_access_token");

    if (hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      accessToken = params.get("access_token");
      if (accessToken) {
        localStorage.setItem("discord_access_token", accessToken);
        // Clean hash from URL
        window.history.replaceState(null, null, window.location.pathname);
      }
    }

    if (!accessToken) {
      window.location.href = DISCORD_AUTH_URL;
      return;
    }

    try {
      const user = await fetchDiscordUser(accessToken);
      window.userid = user.id;
      console.log("Logged in as Discord User ID:", window.userid);
      this.setState({ isAuthenticating: false });
    } catch (error) {
      console.error("Discord auth failed:", error);
      localStorage.removeItem("discord_access_token");
      window.location.href = DISCORD_AUTH_URL;
    }
  }

  getLocaleString = (stringName, languageCodeOverride) => {
    // Always use 'en'
    const countryCode = "en";
    if (countryCode in Locale) {
      let stringSegments = stringName.split("/");
      const stringLast = stringSegments.pop();
      let folder = Locale[countryCode].strings;
      for (const stringSegment of stringSegments) {
        folder = folder[stringSegment];
      }
      if (folder[stringLast] === null) {
        return this.getLocaleString(stringName, "en");
      } else {
        return folder[stringLast];
      }
    } else {
      return this.getLocaleString(stringName, "en");
    }
  };

  onEdgeWarningButtonClick = () => {
    this.setState({ displayingEdgeWarning: false });
  };

  onCorruptedPresetWarningButtonClick = () => {
    this.setState({ displayingCorruptedPresetWarning: false });
  };

  showCorruptedPresetWarning = () => {
    this.setState({ displayingCorruptedPresetWarning: true });
  };

  render() {
    const { displayingCorruptedPresetWarning, displayingEdgeWarning, isAuthenticating } = this.state;

    if (isAuthenticating) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", fontSize: "1.5rem", background: "#151515" }}>
          Authenticating with Discord...
        </div>
      );
    }

    return (
      <React.Fragment>
        <div className="titleAndLanguages">
          <span><h1>MapCore 6b6t</h1></span>
        </div>
        <Header getLocaleString={this.getLocaleString} countryCode={"en"} />
        <MapartController getLocaleString={this.getLocaleString} onCorruptedPreset={this.showCorruptedPresetWarning} />
        <div className="fixedMessages">
          {displayingEdgeWarning ? (
            <div className="fixedMessage">
              <p>{this.getLocaleString("EDGE-WARNING").replace("\\n", "\n")}</p>
              <button type="button" onClick={this.onEdgeWarningButtonClick}>
                ✔️
              </button>
            </div>
          ) : null}
          {displayingCorruptedPresetWarning ? (
            <div className="fixedMessage">
              <p>{this.getLocaleString("BLOCK-SELECTION/PRESETS/IMPORT-ERROR-CORRUPTED")}</p>
              <button type="button" onClick={this.onCorruptedPresetWarningButtonClick}>
                ❗
              </button>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default Root;
