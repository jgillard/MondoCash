var Router = {

  showHomePage: function() {
    $("#login-page").removeClass("hidden");
    $("#home-page").removeClass("hidden");
    $("#cash-page").addClass("hidden");
    $("#cash-prompt-page").addClass("hidden");
  },

  showCashPage: function(title, desc) {
    $("#login-page").removeClass("hidden");
    $("#home-page").addClass("hidden");
    $("#cash-page").removeClass("hidden");
    $("#cash-prompt-page").addClass("hidden");
    $("#cash-prompt").text(title);
    $("#cash-prompt-desc").text(desc);
  },

  showCashPromptPage: function() {
    $("#login-page").removeClass("hidden");
    $("#home-page").addClass("hidden");
    $("#cash-page").addClass("hidden");
    $("#cash-prompt-page").removeClass("hidden");
  },

};

module.exports = Router;