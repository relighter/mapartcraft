import React, { Component } from "react";

import Header from "./header";
import MapartController from "./mapart/mapartController";

import Locale from "../locale/locale";

import { DISCORD_AUTH_URL, fetchDiscordUser, isDiscordConfigured } from "../utils/discordAuth";

import "./root.css";

class Root extends Component {
  state = {
    displayingCorruptedPresetWarning: false,
    displayingEdgeWarning: false,
    isAuthenticating: true,
    authError: null,
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
    // Check if we already have the userid in this session
    const cachedUserId = sessionStorage.getItem("discord_userid");
    if (cachedUserId) {
      window.userid = cachedUserId;
      this.setState({ isAuthenticating: false });
      return;
    }

    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // Check for Discord errors in query params
    if (searchParams.has("error")) {
      this.setState({
        authError: `Discord Error: ${searchParams.get("error_description") || searchParams.get("error")}`,
        isAuthenticating: false
      });
      return;
    }

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
      // If we just came back from a failed attempt or cancelled, don't auto-redirect
      if (searchParams.has("error") || this.state.authError) {
        this.setState({ isAuthenticating: false });
      } else {
        this.redirectToDiscord();
      }
      return;
    }

    try {
      const user = await fetchDiscordUser(accessToken);
      window.userid = user.id;
      sessionStorage.setItem("discord_userid", user.id);
      console.log("Logged in as Discord User ID:", window.userid);
      this.setState({ isAuthenticating: false });
    } catch (error) {
      console.error("Discord auth failed:", error);
      localStorage.removeItem("discord_access_token");
      this.setState({
        authError: error.message === "UNAUTHORIZED" ? "Session expired. Please login again." : "Failed to retrieve user info from Discord.",
        isAuthenticating: false
      });
    }
  }

  redirectToDiscord = () => {
    if (!isDiscordConfigured()) {
      this.setState({
        authError: "Discord Client ID is not configured! Please set REACT_APP_DISCORD_CLIENT_ID in your .env file or Netlify settings.",
        isAuthenticating: false
      });
      return;
    }
    window.location.href = DISCORD_AUTH_URL;
  };

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
    const { displayingCorruptedPresetWarning, displayingEdgeWarning, isAuthenticating, authError } = this.state;

    if (isAuthenticating) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", fontSize: "1.5rem", background: "#151515" }}>
          Authenticating with Discord...
        </div>
      );
    }

    if (authError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", background: "#151515", padding: "20px", textAlign: "center" }}>
          <h1 style={{ color: "#ff4444" }}>Authentication Failed</h1>
          <p style={{ maxWidth: "500px", margin: "10px 0 20px" }}>{authError}</p>
          <button
            type="button"
            onClick={this.redirectToDiscord}
            style={{ padding: "12px 24px", fontSize: "1.1rem", cursor: "pointer", background: "#5865F2", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold" }}
          >
            Login with Discord
          </button>
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
