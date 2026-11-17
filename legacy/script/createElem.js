function createElement(parent, elemId, elemType) {
    var elemWidth = $(parent).css("width");
    $(this).removeClass("onHoverActive");

    /* elements to Create */
    var elem = $("<div class='elemStruct'></div>");
    var headerElem = $("<div class='elemHeader'></div>");
    var innerElem = $("<div class='innerElements innerDroppable'></div>");
    var bottomElem = $("<div class='elemBottom'></div>");
    var elemTitle = $("<div class='elemTitle'></div>");

    var innerElemTable = $("<div class='innerElementTable'></div>");
    var innerElemCell = $("<div class='innerElementCell'></div>");
    var dataType = null;
    var CanvasElementID = null;

    switch (elemType) {
        case "0":
            $(elem).addClass("elemStruct0");

            $(elemTitle).html("While-Schlaufe");
            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem);

            dataType = "While-Schlaufe";
            break;
        case "1":
            $(elem).addClass("elemStruct1");

            $(elemTitle).html("DoWhile-Schlaufe");
            $(headerElem).html("&emsp;");
            $(bottomElem).append(elemTitle);

            $(elem).append(innerElem).append(bottomElem);

            dataType = "DoWhile-Schlaufe";
            break;
        case "2":
            $(elem).addClass("elemStruct2");

            $(elemTitle).html("For-Schleife");
            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem);

            dataType = "For-Schleife";
            break;
        case "3":
            $(elem).addClass("elemStruct3");

            $(elemTitle).html("if else");
            var innerCellOne = $("<div class='innerElementCell innerDroppable'></div>");
            var innerCellSeperator = $("<div class='innerElementCellSeperator'><div class='innerElementCellSeperatorLine'></div></div>");
            var innerCellTwo = $("<div class='innerElementCell innerDroppable'></div>");
            var line1 = $("<div class='line1'></div>");
            var line2 = $("<div class='line2'></div>");
            $(line1).attr("percentage", "50");
            $(line1).append($("<svg style='width: 100%; height: 100%'><line x1='0' y1='0' x2='100%' y2='100%' style='stroke:rgb(0,0,0);stroke-width:1'/></svg>"));
            $(line2).append($("<svg style='width: 100%; height: 100%'><line x1='0' y1='100%' x2='100%' y2='0' style='stroke:rgb(0,0,0);stroke-width:1'/></svg>"));


            $(headerElem).append(line1).append(elemTitle).append(line2);
            $(innerElemTable).append($(innerCellOne)).append($(innerCellSeperator)).append($(innerCellTwo));

            $(elem).append(headerElem).append(innerElemTable);

            dataType = "if else";
            break;
        case "4": //switch

            $(elem).addClass("elemStruct4");

            $(elemTitle).html("switch");

            var innerCellOne = $("<div class='innerElementCell innerDroppable' caseCondition='1'></div>"),
                innerCellSeperator = $("<div class='innerElementCellSeperator defaultSeperatorCell'><div class='innerElementCellSeperatorLine'></div></div>"),
                innerCellTwo = $("<div class='innerElementCell innerDroppable defaultSeperatorCell' caseCondition='default'></div>"),
                line1 = $("<div class='line1'></div>"),
                line2 = $("<div class='line2'></div>"),
                headerSep1 = $("<svg style='width: 100%; height: 100%;'><line x1='0' y1='0' x2='100%' y2='100%' style='stroke:rgb(0,0,0);stroke-width:1'/><rect width='100%' height='100%' fill='white' class='triangleCut' style='clip-path: polygon(0% 0%, 50% 0%, 100% 0%, 100% 100%)'/></svg>"),
                headerSep2 = $("<svg style='width: 100%; height: 100%;'><line x1='0' y1='100%' x2='100%' y2='0' style='stroke:rgb(0,0,0);stroke-width:1'/><rect width='100%' height='100%' fill='white' class='triangleCut' style='clip-path: polygon(0% 100%, 100% 0%, 100% 0%, 100% 100%)'/></svg>"),
                headerSeperator = $("<div class='headerSeperator defaultSeperatorCell'><div class='text'>1</div></div>");
            $(line1).append(headerSep1);
            $(line2).append(headerSep2);
            var parentWith;


            $(headerSeperator).css({ width: (parseInt($(parent).css("width")) / 2) - 1.5 + "px" });
            $(headerElem).append(headerSeperator).append(line1).append(elemTitle).append(line2);
            $(innerElemTable).append($(innerCellOne)).append($(innerCellSeperator)).append($(innerCellTwo));


            $(elem).attr("defaultActive", "true").addClass("defaultActive");
            $(elem).append(headerElem).append(innerElemTable);

            dataType = "switch";
            break;
        case "5":
            $(elem).addClass("elemStruct5");
            $(elem).attr("engineChecked", "false");
            $(elemTitle).html("Anweisung");
            $(headerElem).append(elemTitle);

            $(elem).append(headerElem);

            dataType = "Anweisung";
            break;
        case "6":
            $(elem).addClass("elemStruct6");
            $(elem).attr("engineChecked", "false");
            $(elemTitle).html("Define");
            $(headerElem).append(elemTitle);

            $(elem).append(headerElem);

            dataType = "Define";
            break;
        case "7":
            $(elem).addClass("elemStruct7");
            $(elem).attr("engineChecked", "false");
            $(elemTitle).html("Funktion");
            $(headerElem).append($("<div class='beforePart'></div>")).append(elemTitle).append($("<div class='afterPart'></div>"));

            $(elem).append(headerElem);

            dataType = "Funktion";
            break;
        default:
            break;
    }
	var attrId = "elemStruct" + $(".elemStruct").length,
		i=0;

	while($("#" + attrId).length > 0 ) {
		attrId = "elemStruct" + ($(".elemStruct").length+i);
		i++;
	}
    $(elem).attr({
        draggable: "true",
        id: attrId,
        data_type: dataType,
        data_title: "",
        data_description: "",
        enginechecked: "false"
    }).addClass("draggable");



    if ($(parent).hasClass("insertBefore")) {
        $(elem).insertBefore($(parent).after());
        //$(parent).parent().parent().children(".innerDroppable").prepend(elem);
    } else if ($(parent).hasClass("insertAfter")) {
        $(elem).insertAfter($(parent).prev());
    } else if ($(parent).hasClass("innerDroppable")) {
        $(parent).append(elem);
    }



    $(".insertBefore").each(function() {
        if ($(this).children().length == 0) {
            $(this).remove();
        }
    });
    $(".insertAfter").each(function() {
        if ($(this).children().length == 0) {
            $(this).remove();
        }
    });




}

function ReturndragElement(elemType) {
    /* elements to Create */
    var elem = $("<div class='elemStruct'></div>");
    var headerElem = $("<div class='elemHeader'></div>");
    var innerElem = $("<div class='innerElements innerDroppable'></div>");
    var bottomElem = $("<div class='elemBottom'></div>");
    var elemTitle = $("<div class='elemTitle'></div>");

    var innerElemTable = $("<div class='innerElementTable'></div>");
    var innerElemCell = $("<div class='innerElementCell'></div>");
    var dataType = null;
    var CanvasElementID = null;

    switch (elemType) {
        case "0":
            $(elem).addClass("elemStruct0");

            $(elemTitle).html("While-Schlaufe");
            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem).append(bottomElem);

            dataType = "While-Schlaufe";
            break;
        case "1":
            $(elem).addClass("elemStruct1");

            $(elemTitle).html("DoWhile-Schlaufe");
            $(headerElem).html("&emsp;");
            $(bottomElem).append(elemTitle);

            $(elem).append(headerElem).append(innerElem).append(bottomElem);

            dataType = "DoWhile-Schlaufe";
            break;
        case "2":
            $(elem).addClass("elemStruct2");

            $(elemTitle).html("For-Schleife");
            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem).append(bottomElem);

            dataType = "For-Schleife";
            break;
        case "3":
            $(elem).addClass("elemStruct3");

            $(elemTitle).html("if else");

            var innerCellOne = $("<div class='innerElementCell innerDroppable'></div>");
            var innerCellTwo = $("<div class='innerElementCell innerDroppable'></div>");
            var line1 = $("<div class='line1 3'></div>");
            $(line1).attr("style_attr", "50");
            $(headerElem).append(line1).append(elemTitle).append("<div class='line2'></div>");
            $(innerElemTable).append($(innerCellOne)).append($(innerCellTwo));

            $(elem).append(headerElem).append(innerElemTable);
            break;
        case "4":
            $(elem).addClass("elemStruct3");
            break;
        case "5":
            $(elem).addClass("elemStruct5");
            $(elem).attr("engineChecked", "false");
            $(elemTitle).html("Anweisung");
            $(headerElem).append(elemTitle);

            $(elem).append(headerElem);

            dataType = "Anweisung";
            break;
        default:

            break;
    }
    return elem;
}