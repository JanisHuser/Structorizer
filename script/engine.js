var engine = function(context) {
	if (this.__proto__.constructor !== engine) {
        return new engine(context);
    }
    this.context = context;
	
	var variablesList = [];
	
	this.initEngine = function(callback) {
		
		//var instructions = document.querySelectorAll(".informationDiv .information_content .informationContent .characteristicsDiv.characteristicsEngine .characteristicsDivContent .variableNameInput
		callback();
	}
	this.updateVariables = function() {
		var instructions = document.querySelectorAll(".elemStruct.elemStruct5");
			for( var i=0; i < instructions.length; i++ ) {
				if( instructions[i].getAttribute("engineChecked") == "false") {
					var textContent = instructions[i].getAttribute("data_title");
					if( textContent.indexOf("=") !== -1 && (textContent.split("=").length -1)== 1) {		//detect a variable
						var splited1 = textContent.split("=");
						var obj = {};
						if( splited1[0].indexOf(" ") !== -1 ) {		//contains a space
							obj["name"] = splited1[0].split(" ")[0];
						}
						if( splited1[1].indexOf(" ") !== -1 ) {
							var split2 = splited1[1].split(" "),
							split2Len = split2.length;
							for( var j = 0; j < split2Len; j++ ) {
								if( split2[j] == " " || split2[j] == "") {
									split2.splice(j, 1);
								}
							}
						}
						obj["value"] = split2[0];
						variablesList.push(obj);
						console.log(variablesList);
						instructions[i].setAttribute("engineChecked", "true")
					}
				}
			}	
	}
	
	this.customListenerClasses = function( type, elem, callback ) {
		document.body.addEventListener(type, function(e) {
			if( elem != "" ) {
				if( (e.target).classList.contains(elem) ) {
					callback(e);
				}
			} else {
				callback(e);
			}
			
		});
	}
	
}

$(document).ready(function() {
	
	//search every Entry for a Variable
	var variablesList = [];
	setInterval(function() { var instructions = document.querySelectorAll(".elemStruct.elemStruct5");
		for( var i=0; i < instructions.length; i++ ) {
			if( instructions[i].getAttribute("engineChecked") == "false") {
				var textContent = instructions[i].getAttribute("data_title");
				if( textContent.indexOf("=") !== -1 && (textContent.split("=").length -1)== 1) {		//detect a variable
					var splited1 = textContent.split("=");
					var obj = {};
					if( splited1[0].indexOf(" ") !== -1 ) {		//contains a space
						obj["name"] = splited1[0].split(" ")[0];
					}
					if( splited1[1].indexOf(" ") !== -1 ) {
						var split2 = splited1[1].split(" "),
						split2Len = split2.length;
						for( var j = 0; j < split2Len; j++ ) {
							if( split2[j] == " " || split2[j] == "") {
								split2.splice(j, 1);
							}
						}
					}
					obj["value"] = split2[0];
					variablesList.push(obj);
					console.log(variablesList);
					instructions[i].setAttribute("engineChecked", "true")
				}
			}
		}
	}, 500);
	$(document).on("change keyup keydown", ".informationDiv .information_content .informationContent .characteristicsDiv .characteristicsDivContent .singleCharacteristics.varName input", function(e) {
		var foundVariable = false;
		for( var i=0; i < variablesList.length; i++ ) {
			if( variablesList[i].name == $(this).val() ) {
				foundVariable = true;
				break;
			}
		}
		if( foundVariable == true ) {
			$(this).parent().children(".state").html("&#10004;").addClass("found").removeClass("error");
		} else {
			$(this).parent().children(".state").html("&times;").addClass("error").removeClass("found");
			
		}
	});
	
});