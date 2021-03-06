import Router from "./router";

var CashPrompt = {

  init: function () {
    this.bindUIActions();
  },

  bindUIActions: function () {
    $("#cash-prompt-send").click(function () {
      CashPrompt.feedPost();
      CashPrompt.showCashPage();
    });

    $("#cash-prompt-cancel").click(function () {
      CashPrompt.showCashPage();
    });
  },

  showCashPage: function () {
    Router.showCashPage("", "");
  },

  feedPost: function () {
    var title = $("#cash-prompt-send").data().title;
    var body = $("#cash-prompt-send").data().desc;
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
      dataType: "json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));
      },
      success: function (data, textStatus, xhr) {
        if (xhr.status !== 200) alert(xhr.status, textStatus);else {
          $("#cash-prompt-send").text("Done!");
        }
      },
      failure: function (errMsg) {
        alert(errMsg);
      }
    });
  }

};

module.exports = CashPrompt;