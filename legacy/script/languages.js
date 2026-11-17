document.addEventListener("DOMContentLoaded", function(e) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlDoc = xhttp.responseXML;
            var lId = xmlDoc.getElementsByTagName("lId");
            for (var i = 0; i < lId.length; i++) {
                var elem = document.querySelectorAll("." + lId[i].nodeName);
                for (var j = 0; j < elem.length; j++) {
                    elem[j].innerHTML = lId[i].nodeValue;
                }
            }
        }
    };

    /* if (lFileExists(navigator.language)) {
         xhttp.open("GET", "language/" + navigator.language + ".xml", true);
         Connect.setRequestHeader("Content-Type", "text/xml")
         xhttp.send();
     }*/


});

function lFileExists(language) {
    var http = new XMLHttpRequest();
    http.open('HEAD', "language/" + navigator.language + ".xml", false);
    http.send();
    return http.status != 404;
}