$(document).ready(function() {
    var activeType = null,
        activeInfoElem = null;
    //double click on Element
    $(document).on("dblclick", ".elemStruct, .mainStruct", function(e) {
        var elemTitle = $(this).attr("data_title"),
            elemDescription = $(this).attr("data_description");
        activeInfoElem = $(this).attr("id");
		if( $(this).hasClass("mainStruct")) {
			activeType = 100;
		} else if ($(this).hasClass("elemStruct0")) { //while Loop
            activeType = 0;
        } else if ($(this).hasClass("elemStruct1")) { //do while loop
            activeType = 1;
        } else if ($(this).hasClass("elemStruct2")) { //for loop
            activeType = 2;
        } else if ($(this).hasClass("elemStruct3")) { // if else
            activeType = 3;
        } else if ($(this).hasClass("elemStruct4")) { //switch
            activeType = 4;
        } else if ($(this).hasClass("elemStruct5")) { //statement
            activeType = 5;
        }
		var structType = "";
        switch (activeType) {
            case 0:
			structType
                structType = "While-Schlaufe";
                break;
            case 1:
                structType = "DoWhile-Schlaufe";
                break;
            case 2:
                structType = "For-Schlaufe";
                break;
            case 3:
                structType = "If else";
                break;
            case 4:
                structType = "Switch";
                break;
            case 5:
                structType = "Anweisung";
                break;
			case 100:
				structType = "Struktogramm";
				break;
        }
		$(".informationDiv .information_content .informationHeader .itemInformationType").html(structType);
        //s$(".informationDiv").show();
        $(".customInput.informationContentTitle").val($(this).attr("data_title"));
        $(".customTextArea.informationContentDescription").html($(this).attr("data_description"));

        if (!$(e.target).hasClass("innerDroppable")) {
        	$(".informationDiv").show();
        	activeInfoElem = $(this).attr("id");
        	activeInfoType = $(this).attr("data_tye");

        	
        	
        	
		}
        e.stopPropagation();
    });
    $(".informationDiv .information_content .informationLogic .abbortButton").click(function() {
        var title = $(".informationDiv .titleInformation .informationTitle").html();
        var description = $(".informationDiv .descriptionInformation .informationDescription").html();

        if (title == "") {
            title = activeInfoType;
        }
        $("#" + activeInfoElem).attr("data_title", title).attr("data_description", description);
        $("#" + activeInfoElem).find(".elemTitle").html(title);
        $(".informationDiv").hide();
    });
    $(".informationDiv .information_content .informationLogic .okButton").click(function() {
        var title = $(".customInput.informationContentTitle").val(),
            comment = $(".customTextArea.informationContentDescription").html();
        $(".informationDiv").hide();

        if (title != "") {
            $("#" + activeInfoElem + " .elemHeader .elemTitle").html(title);
        }
        $("#" + activeInfoElem).attr("data_title", title).attr("data_description", comment).attr("enginechecked", "false");
        $(".customTextArea.informationContentDescription").html("");
        $(".customInput.informationContentTitle").val("");
    });
});