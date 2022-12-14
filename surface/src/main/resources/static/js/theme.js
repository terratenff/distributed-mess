function toggleDarkMode() {
    var option = readCookie("darkmode");
    var optionReverse = "true";
    var stylesheet = document.getElementById("sitestyle");

    var styleName = "/css/dark";
    if (option === "true") {
        optionReverse = "false";
        styleName = "/css/light";
    }

    stylesheet.href = styleName + '.css';
    createCookie("darkmode", optionReverse);
}

function initializeDarkMode() {
    var option = readCookie("darkmode");

    var head = document.head;
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.id = "sitestyle";

    var styleName = "/css/light";
    if (option === "true") {
        styleName = "/css/dark";
    }
    link.href = styleName + ".css";
    head.appendChild(link);
}

initializeDarkMode();
