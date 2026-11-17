var simulationDataTypes = new Array("char","string","int","float","double","void");

var simulation = function(context) {
    if (this.__proto__.constructor !== simulation) {
        return new simulation(context);
    }
    this.context = context;

	
	
    this.createLayout = function() {
        var simulationScreen = $("<div></div>"),
            simulationTools = $("<div class='simulationTools'></div>"),
            simulationContent = $("<div class='simulationContent'></div>");

        var simulationToolsPart = $("<div class='simulationToolsPart'></div>"),
            simulationToolsPartTitle = $("<div class='simulationToolsPartTitle'></div>"),
            simulationToolsPartContent = $("<div class='simulationToolsPartContent'></div>"),
            simulationToolsButtonStop = $('<div title="Fortsetzen" class="simulationToolsButton simulationToolStopPlayButton"><svg enable-background="new 0 0 23 29" height="29px" id="Layer_1" version="1.1" viewBox="0 0 23 29" width="23px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="0,28.524 23,14.175 0,-0.175 "/></svg></div>'),
			simulationToolsButtonBack = $('<div title="Schritt zur&uuml;ck" class="simulationToolsButton simulationToolNextButton"><svg enable-background="new 0 0 22 30" height="30px" id="Layer_1" version="1.1" viewBox="0 0 22 30" width="22px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polygon points="22,29.524 5,15.175 22,0.825  "/><polygon points="5,0 5,14.175 5,15.175 5,29 0,29 0,0  "/></g></svg></div>'),
			simulationToolsButtonNext = $('<div title="Schritt vorw&auml;rts" class="simulationToolsButton simulationToolBackButton"><svg enable-background="new 0 0 22 30" height="30px" id="Layer_1" version="1.1" viewBox="0 0 22 30" width="22px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polygon points="0,29.524 17,15.175 0,0.825  "/><polygon points="17,0 17,14.175 17,15.175 17,29 22,29 22,0  "/></g></svg></div>'),
			simulationToolsButtonRestart = $('<div title="Neu starten" class="simulationToolsButton simulationToolBackButton"><svg enable-background="new 0 0 41 34" height="34px" id="Layer_1" version="1.1" viewBox="0 0 41 34" width="41px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M33.949,16C33.429,7.08,26.051,0,17,0C7.611,0,0,7.611,0,17s7.611,17,17,17v-6c-6.075,0-11-4.925-11-11  S10.925,6,17,6c5.737,0,10.443,4.394,10.949,10h-6.849L31,25.899L40.899,16H33.949z"/></svg></div>'),

			simulationContentHeader = $("<div class='simulationContentHeader'><div class='text'>Simulation<div></div>");


		$(".structContent").css({
			overflow: "hidden"
		});
        $(simulationToolsPartTitle).html("Platzhalter");

		$(simulationContent).append(simulationContentHeader);
        $(simulationToolsPartContent).append(simulationToolsButtonStop).append(simulationToolsButtonBack).append(simulationToolsButtonNext).append(simulationToolsButtonRestart);
        $(simulationToolsPart).append(simulationToolsPartTitle).append(simulationToolsPartContent)



        $(simulationTools).append(simulationToolsPart);


$(simulationScreen).append(simulationContent).append(simulationTools);
        $(simulationScreen).css({
            position: "absolute",
            width: "0px",
			marginLeft: "100%"
        }).addClass("simulationPage");
        
        $("body").append(simulationScreen);
        $("body").css({
            position: "relative",
            overflow: "hidden"
        });
        window.setTimeout(function() {
            $(".simulationPage").css({
                position: "absolute",
                width: "100%",
                display: "inline-block",
				marginLeft: "0"
            });
            $(".normalView").css({
                position: "absolute",
                width: "0px",
                display: "inline-block"
            });
        }, 20);







        /*


        var simulationTools = $("<div class='simulationTools'></div>"),
            variableList = $("<div class='variablesList'></div>"),
            variableListTable = $("<table class='variableListTable'></table>");

        $(variableList).append($("<div class='simulationToolsTitle'>Variablen:</div>"));

        $(variableListTable).append($("<tr class='tableHeader'><th>Typ:</th><th>Name:</th><th>Wert:</th></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));
        $(variableListTable).append($("<tr class='tableItem'><td>int</td><td>test</td><td>150</td></tr>"));

        $(variableList).append($(variableListTable));
        $(simulationTools).append($(variableList));

        //$(".navigation").animate({ "margin-left": '-=250' }, 250); //hide Navigation Menu
        window.setTimeout(function() {
            $(".simulationTools").remove();
            $("body").append(simulationTools);
        }, 250);

        $(".structContent").append($("<div class='currentPositionCursor'><div>"));

        */
    }

    var steps = new Array(),
        stepPosition = 0,
        currentElement = $(".structContent .mainStruct#mainStruct0 .innerDroppable").children(".elemStruct").first(),
        parentElement = $(".structContent .mainStruct#mainStruct0");


    this.getSteps = function() {
        $(".structContent").find(".mainStruct#mainStruct0").each(function() {
            $(this).children(".dropZone").each(function() {
                $(this).children(".elemStruct").each(function() {
                    var singleStep = { id: '', type: '', condition: '', cases: '', children: '' };
                    singleStep.id = $(this).attr("id");
                    singleStep.id = $(this).attr("id");
                    if ($(this).hasClass("elemStruct0")) { //while loop
                        singleStep.type = "0";
                        singleStep.condition = $(this).attr("simulationCondition");
                    } else if ($(this).hasClass("elemStruct1")) { //doWhile loop
                        singleStep.type = "1";
                    } else if ($(this).hasClass("elemStruct2")) { //for loop
                        singleStep.type = "2";
                    } else if ($(this).hasClass("elemStruct3")) { //if
                        singleStep.type = "3";
                    } else if ($(this).hasClass("elemStruct4")) { //switch
                        singleStep.type = "4";
                    } else if ($(this).hasClass("elemStruct5")) { //anweisung
                        singleStep.type = "5";
                    } else if ($(this).hasClass("elemStruct6")) { //define
                        singleStep.type = "6";
                    } else if ($(this).hasClass("elemStruct7")) { //funktion
                        singleStep.type = "7";
                    }
                    steps.push(singleStep);
                });
            });
        });
        $(currentElement).addClass("simulationActive");
    }


    this.singleStepForward = function() {
        $(".elemStruct").removeClass("simulationActive");
        if ($(currentElement).children(".innerElements")) {
            parentElement = currentElement;
            currentElement = $(currentElement).children(".innerElements").children(".elemStruct");
            $(currentElement).addClass("simulationActive");
        } else if ($(currentElement).has(".innerElementTable")) {

        } else {
            currentElement = $(currentElement).next();
        }
        $(currentElement).css("background", "red");

        if ($(this).hasClass("elemStruct0")) { //while loop
        } else if ($(this).hasClass("elemStruct1")) { //doWhile loop
        } else if ($(this).hasClass("elemStruct2")) { //for loop
        } else if ($(this).hasClass("elemStruct3")) { //if
        } else if ($(this).hasClass("elemStruct4")) { //switch
        } else if ($(this).hasClass("elemStruct5")) { //anweisung
        } else if ($(this).hasClass("elemStruct6")) { //define
        } else if ($(this).hasClass("elemStruct7")) { //funktion
        }
    }
    this.singleStepBackWards = function() {
        if (stepPosition > 0) {
            if ($(this).hasClas("elemStruct0")) {

            } else if ($(this).hasClass("elemStruct1")) {

            } else if ($(this).hasClass("elemStruct2")) {

            } else if ($(this).hasClass("elemStruct3")) {

            } else if ($(this).hasClass("elemStruct4")) {

            } else if ($(this).hasClass("elemStruct5")) {

            } else if ($(this).hasClass("elemStruct6")) {

            }
            stepPosition--;
        }
    }
}

var simulationActiveRun = false;
$(document).on("click", ".simulationToolsButton.simulationToolStopPlayButton", function() {
	simulationActiveRun ^= true;

	if(simulationActiveRun) {
		$(this).html('<svg enable-background="new 0 0 23 29" height="29px" id="Layer_1" version="1.1" viewBox="0 0 23 29" width="23px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><rect height="29" width="9"/><rect height="29" width="9" x="14"/></g></svg>').attr("title", "Anhalten");
	} else {
		$(this).html('<svg enable-background="new 0 0 23 29" height="29px" id="Layer_1" version="1.1" viewBox="0 0 23 29" width="23px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="0,28.524 23,14.175 0,-0.175 "/></svg>').attr("title", "Fortsetzen");
	}
});