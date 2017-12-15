$(function () {
    if (!localStorage.getItem("cookieAccepted")) {
        $("#cookie-popin-wrapper").css("display", "block");

        $("#cookie-button").click(function () {
            localStorage.setItem("cookieAccepted", true);
            $("#cookie-popin-wrapper").css("display", "none");
        });
    }
});
