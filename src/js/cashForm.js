import Router from "./router";

var CashForm = {

  init: function() {
    this.bindUIActions();
  },

  bindUIActions: function() {
    $("#cash-header").click(function () {
      Router.showHomePage();
    });

    $("#cash-form").submit(function (e) {
      e.preventDefault();
      CashForm.cashFormSubmit();
    });
  },

  cashFormSubmit: function() {
    var loc = $("#cash-location").val();
    var amount = $("#cash-amount").val();
    var desc = $("#cash-desc").val();

    if (isNaN(amount)) {
      $("#cash-header").text("That's NaN");
      $("#cash-amount").val("");
      return false;
    } else amount = parseFloat(amount);

    var title = "£" + amount.toFixed(2) + " @ " + loc;
    Router.showCashPromptPage(title, desc);

    $("#cash-prompt-send").data({ "title": title, "desc": desc });
    return false;
  }

};

module.exports = CashForm;