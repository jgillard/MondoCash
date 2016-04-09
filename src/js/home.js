var Home = {

  init: function() {
    this.bindUIActions();
  },

  bindUIActions: function() {
    $("#home-header").click(function () {
      Home.showCashPage();
    });

    $("#account-button").click(function () {
      Home.accountButton();
    });

    $("#balance-button").click(function () {
      Home.balanceButton();
    });

    $("#transaction-button").click(function () {
      Home.transactionButton();
    });
  },

  showCashPage: function() {
    $("#home-page").toggleClass("hidden");
    $("#cash-page").toggleClass("hidden");
  },

  accountButton: function() {
    this.queryMondo("https://api.getmondo.co.uk/accounts", null, function (data) {
      localStorage.setItem("account_id", data.accounts[0].id);
      if (localStorage.getItem("account_id")) {
        $("#home-header").fadeOut(600, function () {
          $(this).html("That's a nice name :)").fadeIn();
        });
        $("#account-button").text(data.accounts[0].description);
        $("#balance-button").prop("disabled", false);
        $("#cash-submit").prop("disabled", false);
      } else {
        alert("Something went wrong");
      }
    });
  },

  balanceButton: function() {
    this.queryMondo("https://api.getmondo.co.uk/balance", { account_id: localStorage.getItem("account_id") }, function (data) {
      if (data.balance) {
        var message = data.balance > 5000 ? "Life is good :D" : "Oh dear...";
        $("#home-header").fadeOut(600, function () {
          $("#home-header").html(message).fadeIn();
        });
        $("#balance-button").text("£" + data.balance / 100).fadeIn();
        $("#transaction-button").prop("disabled", false);
      }
    });
  },

  transactionButton: function() {
    this.queryMondo("https://api.getmondo.co.uk/transactions", { account_id: localStorage.getItem("account_id"), "expand[]": "merchant" }, function (data) {
      if (data.transactions) {
        var index = 1;
        var latest = data.transactions[data.transactions.length - index];
        while (latest.is_load === true) {
          latest = data.transactions[data.transactions.length - ++index];
          console.log(latest);
        }
        var message = latest.merchant.name === "Tesco" ? "Yawn" : "What's that?";
        $("#home-header").fadeOut(600, function () {
          $("#home-header").html(message).fadeIn();
        });
        $("#transaction-button").text(latest.merchant.name).fadeIn();
      }
    });
  },

  queryMondo: function(url, data, callback) {
    $.ajax({
      url: url,
      data: data,
      dataType: "json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));
      },
      success: function (data) {
        console.log(data);
        callback(data);
      },
      failure: function (errMsg) {
        alert(errMsg);
      }
    });
  }

};

module.exports = Home;