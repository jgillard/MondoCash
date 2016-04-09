var CashForm = {

  init: function() {
    this.bindUIActions();
  },

  bindUIActions: function() {
    $("#cash-header").click(function () {
      CashForm.showHomePage();
    });

    $("#cash-form").submit(function (e) {
      e.preventDefault();
      CashForm.cashFormSubmit();
    });
  },

  showHomePage: function() {
    $("#home-page").toggleClass("hidden");
    $("#cash-page").toggleClass("hidden");
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
    $("#cash-page").addClass("hidden");
    $("#cash-prompt-page").removeClass("hidden");
    $("#cash-prompt").text(title);
    $("#cash-prompt-desc").text(desc);

    $("#cash-prompt-send").data({ "title": title, "desc": desc });
    return false;
  }

};

module.exports = CashForm;