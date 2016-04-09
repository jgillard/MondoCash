import Router from "./router";

var WindowLoad = {

  init: function () {
    this.login();
  },

  /*** ON WINDOW LOAD, DETERMINE STATE ***/

  login: function () {
    // If in login process (just opened Mondo email)
    if (this.getUrlVars().code) {
      this.handleLoggingIn();
    }
    // If no logged_in key, or not logged in
    else if (!localStorage.getItem("logged_in") || localStorage.getItem("logged_in") === false) {
        this.handleLogin();
      }
      // If logged in and refresh token present
      else if (localStorage.getItem("refresh_token")) {
          this.handleRefreshToken();
        } else {
          this.handleUnexpectedState();
        }
  },

  /*** HANDLE DIFFERENT AUTH LOCALSTORAGE CONFIGURATIONS ***/

  handleLogin: function () {
    Router.showHomePage();
    var randomString = Math.random().toString(36).substring(7);
    localStorage.setItem("expected_state", randomString);
    $("#state").prop("value", randomString);
  },

  handleLoggingIn: function () {
    Router.showHomePage();
    var params = this.getUrlVars();
    if (params.state !== localStorage.getItem("expected_state")) {
      alert("state does not match expected");
    } else {
      this.getAccessKey(params.code);
    }
  },

  handleRefreshToken: function () {
    // If refresh token valid for > 60 seconds longer
    if (Date.now() - localStorage.getItem("refresh_token_expiry") < -60000) {
      Router.showHomePage();
      $("#account-button").prop("disabled", false);
    } else this.getAccessKey();
  },

  handleUnexpectedState: function () {
    var message = "Unexpected State\n";
    for (var i = 0; i < localStorage.length; i++) {
      message += localStorage.key(i) + ": ";
      message += localStorage.getItem(localStorage.key(i)) + ", ";
    }
    console.log(message.substring(0, message.length - 2));
    alert(message.substring(0, message.length - 2));
  },

  /*** HANDLE ACCESS KEY RETRIEVAL ***/

  getAccessKey: function (authorization_code) {
    var data;

    // Getting access token for first time
    if (authorization_code) {
      data = {
        code: authorization_code,
        redirect_uri: "https://dl.dropboxusercontent.com/u/2666739/MondoCash/index.html"
      };
    }
    // Refreshing access token
    else data = { refresh_token: localStorage.getItem("refresh_token") };

    $.ajax({
      url: "https://5bvpwp95yb.execute-api.eu-west-1.amazonaws.com/prod/mondo-lambda-auth",
      data: data,
      success: this.gotAccessKey,
      failure: function (errMsg) {
        alert(errMsg);
      }
    });
  },

  gotAccessKey: function (data) {
    console.log(data);
    if (!data.errorMessage) {
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("refresh_token_expiry", Date.now() + data.expires_in * 1000);
        localStorage.setItem("logged_in", true);
        localStorage.removeItem("expected_state");
        $("#account-button").prop("disabled", false);
      } else alert("Problem with data returned from mondo-lambda-auth");
    } else alert(data.errorMessage);
  },

  /*** HELPER FUNCTIONS ***/

  getUrlVars: function () {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split("=");
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

};

module.exports = WindowLoad;