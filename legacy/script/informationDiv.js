$(document).ready(function() {
    var simulationSingleDiv = $("<div class='simulationSingleDiv'></div>");
    var whileLoopSimulation = $("<div class='singleLine'><div class='title'>Solange:</div><input type='text' class='whileLoopCondition' placeholder='Bedingung'/></div>");
    var forLoopSimulation = $("<div class='singleLine'><div class='title'>Startbedingung:</div><input type='text' class='forLoopSimulationCondition' placeholder='Startbedingung'/></div><div class='singleLine'><div class='title'>Abbruchbedingung:</div><input type='text' class='' placeholder='Abbruchbedingung'/></div><div class='singleLine'><div class='title'>Fortsetzung:</div><input type='text' class='' placeholder='Fortsetzung'/></div>");
    var ifElseSimulation = $("<div class='singleLine'><div class='title'>Bedingung:</div><input type='text' class='ifElseSimulationCondition' placeholder='Bedingung'/></div>"),
        switchSimulation = $("<div class='singleLine'><div class='title'>Bedingung:</div><input type='text' class='switchSimulationCondition' placeholder='Bedingung'/></div>"),
        instructionSimulation = $("<div class='singleLine'><div class='title'>Anweisung:</div><input type='text' class='instructionSimulation' placeholder='Anweisung'/></div>"),
        functionSimulation = $("<div class='singleLine'><div class='title'>Anweisung:</div><input type='text' class='functionSimulation' placeholder='Anweisung'/></div>");

    var activeType = null,
        activeInfoElem = null;
    //double click on Element
    $(document).on("dblclick", ".elemStruct, .mainStruct", function(e) {
        var elemTitle = $(this).attr("data_title"),
            elemDescription = $(this).attr("data_description");
        activeInfoElem = $(this).attr("id");


        $(".informationDiv .informationDivBox .informationContent>.singleDiv>.customToggleSwitch").hide();
        $(".informationDiv .informationDivBox .informationContent>.singleDiv.switchCases").hide();
        $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").html("");
        $(".singleDiv.switchCases>.customList>.customListItems>.customListItem:not(.customListItemAddNew)").remove();
		$(".singleDiv.mainStructParams").hide();
		$(".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem:not(.customListItemAddNew)").remove();
        if ($(this).hasClass("mainStruct")) {
            activeType = 100;
			$(".singleDiv.mainStructParams").show();
	$(".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem.customListItemAddNew>.dataType").html("");
			for(var i=0; i <simulationDataTypes.length; i++) {
var option = $("<option></option>");
				$(option).html(simulationDataTypes[i]);
				$(".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem.customListItemAddNew>.dataType").append($(option));
			}
			//if($(this).attr("params") != null) {
		/*	var params = JSON.parse($(this).attr("params"));
			for(var i=0; i < params.length; i++) {
				if(params[i]) {
				var newChildren = $("<div class='customListItem'></div>");
            	$(newChildren).append("<input type='text' placeholder='Name' class='varName' value='" + params[i].name +"' />");
            	$(newChildren).append("<div class='deleteItem' title='Parameter löschen'>×</div>");
				$(newChildren).attr("dataType", params[i].type).attr("title", params[i].type);
            	$(".singleDiv.mainStructParams>.customListAdvanced>.customListItems").children(".customListItemAddNew").before(newChildren);	
}
			}
*/
		//}
			
				


        } else if ($(this).hasClass("elemStruct0")) { //while Loop
            activeType = 0;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(whileLoopSimulation);
            $(".whileLoopCondition").val($(this).attr("condition"));
        } else if ($(this).hasClass("elemStruct1")) { //do while loop
            activeType = 1;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(whileLoopSimulation);
            $(".whileLoopCondition").val($(this).attr("condition"));
        } else if ($(this).hasClass("elemStruct2")) { //for loop
            activeType = 2;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(forLoopSimulation);
            $(".forLoopSimulationCondition").val($(this).attr("condition"));
        } else if ($(this).hasClass("elemStruct3")) { // if else
            activeType = 3;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(ifElseSimulation);
            $(".ifElseSimulationCondition").val($(this).attr("condition"));
        } else if ($(this).hasClass("elemStruct4")) { //switch
            activeType = 4;
            $(".informationDiv .informationDivBox .informationContent>.singleDiv>.customToggleSwitch").show();
            $(".informationDiv .informationDivBox .informationContent>.singleDiv.switchCases").show();
            $(".singleDivContent.Cases.Switch .characteristicsDivContent .customList").html("");
            $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)").each(function() {
                var newChildren = $("<div class='customListItem'></div>");
                $(newChildren).append("<input type='text' placeholder='Bedingung' class='description' value='" +$(this).attr("casecondition") +"' />");
                $(newChildren).append("<div class='deleteItem'>×</div>");
                $(".singleDiv.switchCases>.customList>.customListItems").prepend(newChildren);
            });
            $("input[name=settingsSwitchCaseDefaultActive]").prop("checked", ($("#" + activeInfoElem).attr("defaultActive") == 'true'));
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(switchSimulation);
        } else if ($(this).hasClass("elemStruct5")) { //statement
            activeType = 5;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(instructionSimulation);
            $(".switchSimulationCondition").val($(this).attr("condition"));
        } else if($(this).hasClass("elemStruct7")) {
            activeType = 7;
            $(".informationDiv .informationDivBox .informationContent>.informationElementContent>.simulationDivContent>.simulationSingleDiv").append(functionSimulation);
            $(".functionSimulation").val($(this).attr("instruction"));
        }
        $(".informationContent .singleDiv .elementTitle").val($(this).attr("data_title"));
        $(".informationContent .singleDiv .elementDescription").html($(this).attr("data_description"));

        if (!$(e.target).hasClass("innerDroppable")) {
            $(".informationDiv").show();
            activeInfoElem = $(this).attr("id");
            activeInfoType = $(this).attr("data_type");
        }

        $(".singleDiv>.elementTitle").val(elemTitle);
        $(".singleDiv>.elementDescription").val(elemDescription);
        e.stopPropagation();
    });
    $(".informationDiv .informationDivBox .informationLogic .abortButton").click(function() {
        $(".informationDiv").hide();
    });
    $(".informationDiv .informationDivBox .informationLogic .acceptButton").click(function() {
        var title = $(".singleDiv>.elementTitle").val(),
            comment = $(".singleDiv>.elementDescription").val();
        $(".informationDiv").hide();

        if (title != "") {
            if (activeInfoElem.indexOf("mainStruct") !== -1) {
                $("#" + activeInfoElem + " .mainStructHeader .title").html(title);
                $(".structTabs .tabItem#" + activeInfoElem.split("mainStruct")[1] + " .text").html(title);
            } else  {
				if($("#" + activeInfoElem + ">.elemBottom>.elemTitle").length > 0) {
					$("#" + activeInfoElem + ">.elemBottom>.elemTitle").html(title);
				} else if($("#" + activeInfoElem + ">.elemHeader>.elemTitle").length > 0) {
					$("#" + activeInfoElem + ">.elemHeader>.elemTitle").html(title);
				}
				$("#" + activeInfoElem).find(".elemTitle:first").html(title);
				console.log(activeInfoElem);
            }
        }
        $("#" + activeInfoElem).attr("data_title", title).attr("data_description", comment).attr("enginechecked", "false");

        switch (activeType) {
            case 0:
                $("#" + activeInfoElem).attr("condition", whileLoopSimulation);
                break;
            case 1:
                $("#" + activeInfoElem).attr("condition", whileLoopSimulation);
                break;
            case 2:
                $("#" + activeInfoElem).attr("condition", forLoopSimulation);
                break;
            case 3:
                $("#" + activeInfoElem).attr("condition", ifElseSimulation);
                break;
            case 4: //switch
                $("#" + activeInfoElem).attr("defaultActive", $("input[name=settingsSwitchCaseDefaultActive]").prop("checked"));
                $("#"+ activeInfoElem).children(".innerElementTable").children(".innerElementCell").each(function() {

                });
                var caseList = $(".singleDiv.switchCases>.customList>.customListItems>.customListItem:not(.customListItemAddNew)");
                if($("#"+ activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)").length != caseList.length) {
                    var i=1;
                    $(caseList).each(function() {
                        if($("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell):nth-child("+ i +")").length) {
                            $("#" + activeInfoElem).children(".innerElementTable>.innerElementCell:not(.defaultSeperatorCell):nth-child("+ i +")").attr("casecondition", $(this).children(".description").val());
                        } else {
                            $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCellSeperator.defaultSeperatorCell").before("<div class='innerElementCellSeperator'><div class='innerElementCellSeperatorLine'></div></div>");
                            $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCellSeperator.defaultSeperatorCell").before("<div class='innerElementCell innerDroppable' casecondition='" + $(this).parent().children(".text").html() + "'></div>");
                            $("#" + activeInfoElem).children(".elemHeader").children(".headerSeperator.defaultSeperatorCell").before("<div class='headerSeperator'><div class='text'>" + $(this).children(".description").val() + "</div></div>");
                        }
                        i++;
                    });
                    var widthComplete = parseFloat($("#" + activeInfoElem).children(".innerElementTable").css("width")),
                        widthToSet;
                        innerElementCells = $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)");
                        var widthCompleteTemp = widthComplete;
                        widthComplete  -= parseFloat($("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell.defaultSeperatorCell").css("width"));
                        widthComplete -= (innerElementCells.length*3);
                        widthToSet = ((widthComplete / widthCompleteTemp) / innerElementCells.length) *100;

                    $(innerElementCells).attr("percentage", widthToSet);
                    $("#" + activeInfoElem).children(".elemHeader").children(".headerSeperator:not(.defaultSeperatorCell)").attr("percentage", widthToSet);
                }


                if($("input[name=settingsSwitchCaseDefaultActive]").prop("checked")) {
                    $("#" + activeInfoElem).removeClass("defaultHidden");
                    $("#"+ activeInfoElem).children(".elemHeader").children(".line1").css("width", $("#"+ activeInfoElem).children(".elemHeader").children(".line1").attr("percentage") + '%');
                    $("#"+ activeInfoElem).children(".elemHeader").children(".line2").css("width", $("#"+ activeInfoElem).children(".elemHeader").children(".line2").attr("percentage") + '%');

                    $("#"+ activeInfoElem).children(".innerElementTable").children(".innerElementCell").each(function() {
                        $(this).css("width", $(this).attr("percentage") + '%');
                    });
                    $("#"+ activeInfoElem).children(".elemHeader").children(".headerSeperator").each(function() {
                        $(this).css("width", $(this).attr("percentage") + '%');
                    });
                } else {
                    $("#" + activeInfoElem).addClass("defaultHidden");
                    if($("#"+ activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)").length == 1) {
                        $("#"+ activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)").css("width", "100%");
                    }
                }
                $("#" + activeInfoElem).attr("condition", $(".switchSimulationCondition").val());
                break;
            case 5:
                $("#" + activeInfoElem).attr("instruction", $(".instructionSimulation").val());
                break;
            case 7:
                $("#" + activeInfoElem).attr("instruction", $(".functionSimulation").val());
                break;
			case 100:
				var params = new Array();
				
				$(".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem:not(.customListItemAddNew)").each(function() {
					params.push({"type":$(this).attr("dataType"), "name": $(this).children(".varName").val()});									
				});
				$("#" + activeInfoElem).attr("params",JSON.stringify(params));
				break;
        }
    });

    $(document).on("keyup keydown", ".informationDiv .information_content .informationContent .singleDivContent.Cases.Switch .characteristicsDivContent .customList .customListItemAdd .text", function(e) {
        var keycode = e.charCode || e.keyCode;
        if (keycode == 13) {
            return false;
        }
    });
    $(document).on("click", ".informationDiv .information_content .informationContent .singleDivContent.Cases.Switch .characteristicsDivContent .customList .customListItemAdd .addCase", function() {
        $("#" + activeInfoElem).children(".innerElementTable").prepend("<div class='innerElementCellSeperator'><div class='innerElementCellSeperatorLine'></div></div>");
        $("#" + activeInfoElem).children(".innerElementTable").prepend("<div class='innerElementCell innerDroppable' casecondition='" + $(this).parent().children(".text").html() + "'></div>");
        $("#" + activeInfoElem).children(".elemHeader").prepend("<div class='headerSeperator'><div class='text'>" + $(this).parent().children(".text").html() + "</div></div>");
        //calculate fields new 
        var parentWidth = parseFloat($("#" + activeInfoElem).children(".innerElementTable").css("width")),
            innerCellAmount = $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCellSeperator").length;

        var pxPerc = (100 / parentWidth);
        var maxWidthParent = 100 - (((innerCellAmount) * 3) * pxPerc);
        var percPerCell = maxWidthParent / (innerCellAmount + 1);
        var setWidth = (parentWidth - ((innerCellAmount) * 3)) / (innerCellAmount + 1);
        $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell").css({
            width: percPerCell + '%'
        });
        var i = 0;
        $("#" + activeInfoElem).children(".elemHeader").find(".headerSeperator").each(function() {
            $(this).css({
                left: percPerCell * i + '%',
                width: percPerCell + (3 * pxPerc) + '%'
            });
            i++;
        });

        $("#" + activeInfoElem).children(".elemHeader").children(".line1").css({
            width: percPerCell * (innerCellAmount) + '%',
            left: 0
        });
        $("#" + activeInfoElem).children(".elemHeader").children(".line2").css({
            width: percPerCell * 1 + '%',
            left: percPerCell * (innerCellAmount) + '%'
        });

        $(".singleDivContent.Cases.Switch .characteristicsDivContent .customList").html("");


        $("#" + activeInfoElem).children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell)").each(function() {
            $(".singleDivContent.Cases.Switch .characteristicsDivContent .customList").append("<div class='customListItem'><div class='dragSymbol'>&#8801;</div><div class='text' contenteditable='true'>" + $(this).attr("caseCondition") + "</div><div class='removeCase'>&#10060;</div></div>");
        });
        $(".singleDivContent.Cases.Switch .characteristicsDivContent .customList").append("<div class='customListItemAdd'><div class='text' contenteditable='true'></div><div class='addCase'>&#10004;</div></div>");

    });

    $(document).on("click", ".informationDiv .informationDivBox .informationContent>.singleDiv>.customList>.customListItems>.customListItem.customListItemAddNew>.addItem", function() {
        if($(this).parent().children(".description").val() != "") {
            var newChildren = $("<div class='customListItem'></div>");
            $(newChildren).append("<input type='text' placeholder='Bedingung' class='description' value='" +$(this).parent().children(".description").val() +"' />");
            $(newChildren).append("<div class='deleteItem' title='Fall löschen'>×</div>");
            $(this).parent().parent().children(".customListItemAddNew").before(newChildren);
            $(this).parent().children(".description").val("");
        }
    });
														
	$(document).on("click", ".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem.customListItemAddNew>.addItem", function() {
		if($(this).parent().children(".varName").val() != "") {
			var newChildren = $("<div class='customListItem'></div>");
            $(newChildren).append("<input type='text' placeholder='Name' class='varName' value='" +$(this).parent().children(".varName").val() +"' />");
            $(newChildren).append("<div class='deleteItem' title='Parameter löschen'>×</div>");
			$(newChildren).attr("dataType", $(this).parent().children(".dataType").val()).attr("title", $(this).parent().children(".dataType").val());
            $(this).parent().parent().children(".customListItemAddNew").before(newChildren);
            $(this).parent().children(".varName").val("");										
		}
	});
    $(document).on("click", ".informationDiv .informationDivBox .informationContent>.singleDiv>.customList>.customListItems>.customListItem>.deleteItem", function() {
        $(this).parent().remove();
    });
 $(document).on("click", ".singleDiv.mainStructParams>.customListAdvanced>.customListItems>.customListItem>.deleteItem", function() {
        $(this).parent().remove();
    });
});