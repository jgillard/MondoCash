"use strict";

$("#home-header, #cash-header").click(function() {
  $("#home-page").toggleClass("hidden");
  $("#cash-page").toggleClass("hidden");
});

$("#cash-form").submit(function() {
  var loc = $("#cash-location").val();
  var amount = parseFloat($("#cash-amount").val());
  var desc = $("#cash-desc").val();
  if (isNaN(amount)) {
    alert("That's NaN");
  } else {
    var title = "£" + amount.toFixed(2) + " @ " + loc;
    feedPost(title, desc);
  }
  return false;
});

function feedPost(title, body) {
  var data = {
    account_id: localStorage.getItem("account_id"),
    type: "basic",
    // url: ""
    params: {
      title: title,
      image_url: "http://www.inmotionhosting.com/support/images/stories/icons/ecommerce/cash-dark.png",
      background_color: "#FFFFE5"
    }
  };
  if (body) data.params.body = body;

  $.ajax({
    type: "POST",
    url: "https://api.getmondo.co.uk/feed",
    data: data,
    dataType : "json",
    beforeSend: function(xhr){xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));},
    success: function(data, textStatus, xhr){
      if (xhr.status !== 200) alert(xhr.status, textStatus);
      else {
        $("#cash-submit").text("Done!");
      }
    },
    failure: function(errMsg) { alert(errMsg); }
  });
}

function queryMondo(url, data, callback) {
  $.ajax({
    url: url,
    data: data,
    dataType : "json",
    beforeSend: function(xhr){xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));},
    success: function(data){
      console.log(data);
      callback(data);
    },
    failure: function(errMsg) {
      alert(errMsg);
    }
  });
}

$("#account-button").click(function() {
  queryMondo("https://api.getmondo.co.uk/accounts", null, function(data) {
    localStorage.setItem("account_id", data.accounts[0].id);
    if (localStorage.getItem("account_id")) {
      $("#home-header").fadeOut(600, function() { $(this).html("That's a nice name :)").fadeIn(); });
      $("#account-button").text(data.accounts[0].description);
      $("#balance-button").prop("disabled", false);
      $("#cash-submit").prop("disabled", false);
    } else {
      alert("Something went wrong");
    }
  });
});

$("#balance-button").click(function() {
  queryMondo("https://api.getmondo.co.uk/balance", {account_id: localStorage.getItem("account_id")}, function(data) {
    if (data.balance) {
      var message = data.balance > 5000 ? "Life is good :D" : "Oh dear...";
      $("#home-header").fadeOut(600, function() { $("#home-header").html(message).fadeIn(); });
      $("#balance-button").text("£" + data.balance/100).fadeIn();
      $("#transaction-button").prop("disabled", false);
    }
  });
});

$("#transaction-button").click(function() {
  queryMondo("https://api.getmondo.co.uk/transactions", {account_id: localStorage.getItem("account_id"), "expand[]": "merchant"}, function(data) {
    if (data.transactions) {
      var latest = data.transactions[data.transactions.length - 1];
      console.log(latest);
      if (latest.is_load === true) latest = data.transactions[data.transactions.length - 2];
      var message = latest.merchant.name === "Tesco" ? "Yawn" : "What's that?";
      $("#home-header").fadeOut(600, function() { $("#home-header").html(message).fadeIn(); });
      $("#transaction-button").text(latest.merchant.name).fadeIn();
    }
  });
});


/*** ON WINDOW LOAD, DETERMINE STATE ***/

window.onload = function() {
  // If in login process (just opened Mondo email)
  if (getUrlVars().code) {
    handleLoggingIn();
  }
  // If no logged_in key, or not logged in
  else if (!localStorage.getItem("logged_in") || localStorage.getItem("logged_in") === false) {
    handleLogin();
  }
  // If logged in and refresh token present
  else if (localStorage.getItem("refresh_token")) {
    handleRefreshToken();
  }
  else {
    handleUnexpectedState();
  }
};

/*** HANDLE DIFFERENT AUTH LOCALSTORAGE CONFIGURATIONS ***/

function handleLogin() {
  $("#login-page").removeClass("hidden");
  var randomString = Math.random().toString(36).substring(7);
  localStorage.setItem("expected_state", randomString);
  $("#state").prop("value", randomString);
}

function handleLoggingIn() {
  $("#home-page").removeClass("hidden");
  var params = getUrlVars();
  if (params.state !== localStorage.getItem("expected_state")) {
    alert("state does not match expected");
  } else {
    getAccessKey(params.code);
  }
}

function handleRefreshToken() {
  // If refresh token valid for > 60 seconds longer
  if (Date.now() - localStorage.getItem("refresh_token_expiry") < -60000) {
    $("#home-page").removeClass("hidden");
    $("#account-button").prop("disabled", false);
  }
  else getAccessKey();
}

function handleUnexpectedState() {
  var message = "Unexpected State\n";
  for (var i = 0; i < localStorage.length; i++){
    message += localStorage.key(i) + ": ";
    message += localStorage.getItem(localStorage.key(i)) + ", ";
  }
  console.log(message.substring(0, message.length - 2));
  alert(message.substring(0, message.length - 2));
}

/*** HANDLE ACCESS KEY RETRIEVAL ***/

function getAccessKey(authorization_code) {
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
    success: gotAccessKey,
    failure: function(errMsg) { alert(errMsg); }
  });
}

function gotAccessKey(data){
  console.log(data);
  if (!data.errorMessage) {
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("refresh_token_expiry", Date.now() + (data.expires_in * 1000));
      localStorage.setItem("logged_in", true);
      localStorage.removeItem("expected_state");
      $("#account-button").prop("disabled", false);
    } else alert("Problem with data returned from mondo-lambda-auth");
  } else alert(data.errorMessage);
}

/*** HELPER FUNCTIONS ***/

function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}