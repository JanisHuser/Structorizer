var downloadStruct = function(callback) {
    var content = "";

    var mainStructs = document.querySelectorAll(".structContent")[0].children;

    content += "<mainStructs>";
    for (var i = 1; i <= mainStructs.length; i++) {
        if (mainStructs[i] != null) {
            content += "<mainStruct title='" + mainStructs[i].getAttribute("dataTitle") + "' id='" + mainStructs[i].getAttribute("id") + "'>";
            var wasHidden = false;
            if (mainStructs[i].style.display == "none") {
                mainStructs[i].style.display = "block";
                wasHidden = true;
            }
            var children = mainStructs[i].children[1].children;

            for (var j = 0; j < children.length; j++) {
                content += addChildToXml(children[j]);
            }


            if (wasHidden) {
                mainStructs[i].style.display = "none";
            }
            content += "</mainStruct>";
        }
    }
    /*mainStructs.forEach(function(element) {
        
    });*/
    content += "</mainStructs>";


    console.log(content);
    callback(content);
}

function addChildToXml(node) {
    var context = "";
    if (node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            var childrens = node.children[i];
            context += "<element type='" + childrens.getAttribute("class").split(' ')[1] + "' title='" + childrens.getAttribute("data_title") + "' description='" + childrens.getAttribute("data_description") + ">";
            context += "<children>";
            if (childrens.children[1] != null) {
                if (childrens.children[1].children.length > 0) {
                    for (var j = 0; j < childrens.children[1].children[j]; j++) {
                        context += addChildToXml(childrens.children[1].children[j]);
                    }
                }
            }
            context += "</children>";
            context += "</element>";
        }
    }
    return context;
}

function textToXML(text) {
    try {
        var xml = null;

        if (window.DOMParser) {

            var parser = new DOMParser();
            xml = parser.parseFromString(text, "text/xml");

            var found = xml.getElementsByTagName("parsererror");

            if (!found || !found.length || !found[0].childNodes.length) {
                return xml;
            }

            return null;
        } else {

            xml = new ActiveXObject("Microsoft.XMLDOM");

            xml.async = false;
            xml.loadXML(text);

            return xml;
        }
    } catch (e) {
        // suppress
    }
}