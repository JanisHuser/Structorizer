window.addEventListener("DOMContentLoaded", function() {
    if ($(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().children("span[contenteditable='true']").html() == "&nbsp;" || $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().html() == "") {
        $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().children("span[contenteditable='true']").html("");
    }
    var keyPressed = {};

    document.addEventListener('keydown', function(e) {
        keyPressed[e.keyCode] = true;
    }, false);
    document.addEventListener('keyup', function(e) {
        keyPressed[e.keyCode] = false;
    }, false);


    $(document).on("keydown", ".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine", function(e) {

        if (e.which == 13) {
            var index = $(this).parent().index();
            var singleLine = $("<span class='singleLine'></span>"),
                innerSpan = $("<span contenteditable='true'></span>");

            var charsBehind = $(this).children("span[contenteditable='true']").text().substring(getCaretPosition() - 1, $(this).children("span[contenteditable='true']").text().length - 1);
            var charsBefore = $(this).children("span[contenteditable='true']").text().substring(0, getCaretPosition() - 1);

            if (charsBefore != null && charsBehind != null) {
                //$(this.childNodes[0]).text(charsBehind);
                //$(innerSpan).text(charsBefore);
            }
            $(singleLine).append(innerSpan);

            $(this).after(singleLine);
            placeCaretAtPos($(this).next().children("span[contenteditable='true']")[0], 0);
        }
        if (e.which == 8) {

            if ($(this).children("span[contenteditable='true']").text() == "" && $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").length > 1) {
                $(':focus').parent().remove();
                window.setTimeout(function() {
                    placeCaretAtEnd($(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine:nth-child(" + ($(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").length) + ")").children("span[contenteditable='true']")[0]);
                }, 50);
            }
            var charToDelete = getCharacterPrecedingCaret(this.childNodes[0]);


			
        }

        if (keyPressed[38]) { //up
            if ($(this).prev().children("span[contenteditable='true']").get(0) != undefined) {
                var charPos = getCaretPosition();
                placeCaretAtEnd($(this).prev().children("span[contenteditable='true']")[0]);

            }
        }
        if (keyPressed[40]) { //down
            if ($(this).next().children("span[contenteditable='true']").get(0) != undefined) {
                placeCaretAtEnd($(this).next().children("span[contenteditable='true']")[0]);
            }
        }
        if (keyPressed[37]) { //left

            if (getCaretPosition(this.childNodes[0]) == 0 && $(this).prev().children("span[contenteditable='true']").get(0) != undefined) {
                placeCaretAtEnd($(this).prev().children("span[contenteditable='true']")[0]);
                return false;
            }

        }
        if (keyPressed[39]) { //right


        }
		if (keyPressed[17] && keyPressed[65]) {
			clip($(".convertCodeToStruct .mainContent .mainContainer .codeContainer")[0]);
			
		}
        //console.log(e.keyCode);

    });

    $(document).on("paste", ".convertCodeToStruct .mainContent .mainContainer .codeContainer", function(e) {
        if ($(":focus").text().length == 1 && $(":focus").text() == "&nbsp;") {
            console.log("a");
        }
        setTimeout(function() {
			console.log("b");
            var content = $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine");
            var splitted = content.children("span[contenteditable='true']:nth-child(1)").html().split('</div>');


            splitted.forEach(function(line) {
                var lineContent = line;
                lineContent = lineContent.replaceAll('<br>', '');
                lineContent = lineContent.replaceAll('<div>', '');
                lineContent = lineContent.replaceAll('&nbsp;', '');
                lineContent = lineContent.replaceAll("&lt;", '<');
                lineContent = lineContent.replaceAll("&gt;", '>');
                lineContent = lineContent.replaceAll("&amp;", '&');

                if (lineContent != "") {
                    var singleLine = $("<span class='singleLine' spellcheck='false'></span>"),
                        innerSpan = $("<span contenteditable='true'></span>");
                    innerSpan.text(lineContent);

                    $(singleLine).append(innerSpan);
                    $(".convertCodeToStruct .mainContent .mainContainer .codeContainer").append(singleLine);
                }

            });

            setTimeout(function() {
                $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine span div").remove();
                $(":focus").parent().remove();
                setTimeout(function() {
                    beautifier();
                }, 10);
                if ($(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().children("span[contenteditable='true']").html() == "&nbsp;" || $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().html() == "") {
                    $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").first().remove();
                }
            }, 5);
            //


        }, 100);
    });
    $(document).on("keyup", ".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine", function(e) {
        //var focused = $(':focus');
        //beautifier();
        //placeCaretAtEnd(focused);

    });

    $(document).on("click", ".mainLogic .LogicAccept", function(e) {
		if($(".convertCodeToStruct .mainContent .mainContainer .codeContainer").html() != "") {
        var codeContent = "";
        $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").each(function() {
			codeContent += $.trim($(this).text());
            codeContent += "\n";


        });
		
        codeContent = codeContent.replaceAll('<br>', '');
        codeContent = codeContent.replaceAll('<div>', '');
        codeContent = codeContent.replaceAll('&nbsp;', '');
        codeContent = codeContent.replaceAll("&lt;", '<');
        codeContent = codeContent.replaceAll("&gt;", '>');
        codeContent = codeContent.replaceAll("&amp;", '&');
        var formData = new FormData();
        formData.append("code", codeContent);
        $.ajax({
            url: "script/getArrays.php",
            type: 'post',
            data: formData,
            dataType: 'html',
            async: true,
            processData: false,
            contentType: false,
            success: function(data) {
                createElements(JSON.parse(data));

            }
        });
}
        //createElements();
    });

    $(document).on("click", ".convertCodeToStruct>.mainContent>.mainLogic>.LogicAbort", function() {
        $(".convertCodeToStruct").hide();
    });
});

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function placeCaretAtPos(el, pos) {
    el.focus();
    if (typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.setStart(el, pos);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

    }
}

function getCharacterPrecedingCaret(containerEl) {
    var precedingChar = "",
        sel, range, precedingRange;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
            range.setStart(containerEl, 0);
            precedingChar = range.toString().slice(-1);
        }
    } else if ((sel = document.selection) && sel.type != "Control") {
        range = sel.createRange();
        precedingRange = range.duplicate();
        precedingRange.moveToElementText(containerEl);
        precedingRange.setEndPoint("EndToStart", range);
        precedingChar = precedingRange.text.slice(-1);
    }
    return precedingChar;
}


function getWithoutEnter(array) {
    var string;
    if (array.length > 0) {
        for (var i = 0; i < array.length - 1; i++) {
            string += array[i];
        }
    }
    return string;
}


function beautifier() {

    var decisions = ["if", "while", "do", "for", "else", "switch", "case"];
    var dataType = ["int", "char", "long", "float", "short", "double", "void"];
    var colors = ["#EE1289;", "#1ABC9C;", "#C09F2D;"];




    window.setTimeout(function() {
        var ifElseEditorColor = "#800080";
        var lengths = $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").length;
        $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").each(function() {
            var cnt = $.trim($(this).children("span[contenteditable='true']").text());
            var foundClosing = 0;
            if (cnt.slice(cnt.length - 1, cnt.length) == "{") {
                foundClosing = 1;
                var nextCnt = $(this).next();
                var i = 0;
                while (foundClosing > 0 && nextCnt && i < lengths && lengths > 0) {
                    i++;
                    if ($(nextCnt).children("span[contenteditable='true']").text().indexOf("{") != -1) { foundClosing++; }
                    if ($(nextCnt).children("span[contenteditable='true']").text().indexOf("}") != -1) { foundClosing--; }
                    if (foundClosing > 0) {
                        var foundClosingCpy = foundClosing;
                        if ($(nextCnt).children("span[contenteditable='true']").text().indexOf("{") != -1) { foundClosingCpy--; }
                        var contentText = $(nextCnt).children("span[contenteditable='true']").html();

                        if (contentText != "undefined" && contentText != null) {
                            var count = (contentText.match(/&nbsp; /g) || []).length;

                            for (var gk = foundClosingCpy; gk >= count; gk--) {

                                $(nextCnt).children("span[contenteditable='true']").html("&nbsp; " + $(nextCnt).children("span[contenteditable='true']").html());
                            }
                        }
                    }
                    nextCnt = $(nextCnt).next();
                }
            }
            var element = $(this);


            for (var i = 0; i < decisions.length; i++) {
                var positions = isValidStatement($(this).text(), decisions[i]);
                if (cutIntoParts($(this).text(), decisions[i])) {
                    $(element).html($(this).html().replace(decisions[i], "<font contenteditable='true' style='color: " + colors[0] + "'>" + decisions[i] + "</font>"));
                }
            }

            for (var i = 0; i < dataType.length; i++) {
                var positions = isValidStatement($(this).text(), dataType[i]);
                if (positions.length > 0) {
                    var actPos = 0;
                    for (var j = 0; j < positions.length; j++) {
                        //console.log($(this).text().substring(positions[j], positions[j] + dataType[i].length));
                    }
                }
                if (cutIntoParts($(this).text(), dataType[i])) {
                    $(element).html($(this).html().replace(dataType[i], "<font contenteditable='true' style='color: " + colors[1] + "'>" + dataType[i] + "</font>"));
                } else {
					$(element).html($(this).html().replace(dataType[i], "<font contenteditable='true' style='color: " + colors[1] + "'>" + dataType[i] + "</font>"));					 
				}
            }
            if (isFunction($(this).text())) {
                var splited = $(this).text().split("(");
                if (splited.length > 1) {
                    var functionName = getLastWord(splited[0]);

                    if (functionName != false) {
                        functionName = functionName.replace("&nbsp; ", '');
                        functionName = functionName.replace(/\s/g, "");
                        if (dataType.lastIndexOf(functionName) == -1 && decisions.lastIndexOf(functionName) == -1) {
                            $(element).html($(this).html().replace(functionName, "<font contenteditable='false' style='color: " + colors[2] + "'>" + functionName + "</font>"));
                        }
                    }

                }


            }
        });
    }, 20);
}
var clip = function(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};


function selectElementContents(el) {
    if (window.getSelection && document.createRange) {
        // IE 9 and non-IE
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.body.createTextRange) {
        // IE < 9
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.select();
    }
}

function getCaretPosition(editableDiv) {
    var caretPos = 0,
        sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
};

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function getCaretPosition() {
    if (window.getSelection && window.getSelection().getRangeAt) {
        var range = window.getSelection().getRangeAt(0);
        var selectedObj = window.getSelection();
        var rangeCount = 0;
        var childNodes = selectedObj.anchorNode.parentNode.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i] == selectedObj.anchorNode) {
                break;
            }
            if (childNodes[i].outerHTML)
                rangeCount += childNodes[i].outerHTML.length;
            else if (childNodes[i].nodeType == 3) {
                rangeCount += childNodes[i].textContent.length;
            }
        }
        return range.startOffset + rangeCount;
    }
    return -1;
}

function searchUntilWordBreak(string) {
    var breakPos = -1;
    if (string.length > 0) {
        for (var i = 0; i < string.length; i++) {
            if (string.substring(i, i) == " ") {
                breakPos = i;
                break;
            } else {
                breakPos = 10;
                break;
            }
        }
    }
    return breakPos;
}

function isValidStatement(string, search) {
    var oks = new Array();
    if (string.indexOf(search) != -1) {
        var length = string.split(search).length;
        for (var i = 0; i < length - 1; i++) {
            if (string.indexOf(search) != -1) {
                if (cutIntoParts(string, search)) {
                    oks.push(((string.search(search) + (i * search.length)) > 0 ? (string.search(search) + (i * search.length) - 1) : (string.search(search) + (i * search.length))));
                }
            }
            string = string.substring(search.length - 1, string.length);
        }
    }
    return oks;
}

function cutIntoParts(string, search) {

    var cutPos = string.indexOf(search);
    var cutted1 = string.substring(0, cutPos),
        cutted2 = string.substring(cutPos + search.length, string.length);


    var before1 = cutted1.substring(cutted1.length - 1, cutted1.length),
        after2 = cutted2.substring(0, 1);
    if ((before1 == "" || before1 == " " || before1 == "(" || before1 == ")") && (after2 == "" || after2 == " " || after2 == "(") && string.indexOf(search) != -1) {
        return true;
    } else {
        return false;
    }
}

function isFunction(string) {
    if (string.indexOf("(") != -1 && (string.indexOf(")") > string.indexOf("("))) {
        return true;
    }
}

function getLastWord(string) {
    var i = 1,
        foundBreak = false;
    while (i < string.length) {
        if (string.substring(i - 1, i).indexOf(" ") != -1 || string.substring(i - 1, i).indexOf("&nbsp;") != -1) {
            foundBreak = true;
            break;
        }
        i++;
    }
    if (foundBreak) {
        return string.substring(i, string.length);
    } else {
        return false;
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

							 
String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};
							 
							 
function getElementsFromArr(arr) {
    if (!Array.isArray(arr)) {
        return createElemType(arr.type, arr.line, arr.comment);

    } else {
        for (var i = 0; i < arr.length; i++) {
            return getElementsFromArr(arr[i]);
        }
    }
}

function createElements(arr) {
    console.log(arr);
    var mainStruct = $(".structContent .mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id") + " .dropZone.innerDroppable"),
        oldElemPos;
    for (var i = 0; i < arr.length; i++) {
        var line = "",
            type = "",
            comment = "",
            children = null;
        if (arr[i] != null) {
            if (arr[i].line.line != undefined && arr[i].line.line != null) {
                line = arr[i].line.line;
            } else if (arr[i].line != undefined && arr[i].line != null) {
                line = arr[i].line;
            }
            if (arr[i].line.type != undefined && arr[i].line.type != null) {
                type = arr[i].line.type;
            } else if (arr[i].type != undefined && arr[i].type != null) {
                type = arr[i].type;
            }
            if (arr[i].line.comment != undefined && arr[i].line.comment != null) {
                comment = arr[i].line.comment;
            } else if (arr[i].comment != undefined && arr[i].comment != null) {
                comment = arr[i].comment;
            }
            if (arr[i].children != undefined && arr[i].children != null) {
                children = arr[i].children;
            }
        }
        if (type != -1 && line) {
            if (line.indexOf("else") === -1) {
                var lineC;
                lineC = getClipContent(line, type);
                var elem = createElemType(type, lineC, arr[i].line.comment);
                if (Array.isArray(children) && children.length > 0) {
                    if (type == 3) {
                        var childArr = getChildElements(arr[i].children);
                        for (var j = 0; j < childArr.length; j++) {
                            $(elem).children(".innerElementTable").children(".innerElementCell").first().append(childArr[j]);
                        }
                    } else if (type == 0 || type == 1 || type == 2) {
                        var childArr = getChildElements(children);
                        for (var j = 0; j < childArr.length; j++) {
                            $(elem).children(".innerElements.innerDroppable").append(childArr[j]);
                        }
                    }
                }
                oldElemPos = $(elem).attr("id");
                $(mainStruct).append(elem);
            } else {
                var lineC;
                lineC = getClipContent(line, type);
                var elem = createElemType(type, lineC, comment);
                if (Array.isArray(children) && children.length > 0) {
                    var childArr = getChildElements(children);
                    for (var j = 0; j < childArr.length; j++) {
                        $(mainStruct).find("#" + oldElemPos).children(".innerElementTable").children(".innerElementCell").last().append(childArr[j]);
                    }
                }
            }
        }
    }
	$(".elemStruct3").each(function() {
        if ($(this).children(".innerElementTable").children(".innerElementCell").last().children().length == 0) {
            var width = parseFloat($(this).children(".innerElementTable").css("width")),
                onePx = 100 / width;
            $(this).children(".innerElementTable").children(".innerElementCell").last().css("width", (onePx * 20) + "%");
            $(this).children(".innerElementTable").children(".innerElementCell").first().css("width", (width - 23) * onePx + "%");
														
			$(this).children(".elemHeader").children(".line2").attr("percentage", (onePx * 20)).css("width", (onePx * 20) + "%").css("margin-left", (width - 23) * onePx + "%");
			$(this).children(".elemHeader").children(".line1").attr("percentage", (width - 23) * onePx).css("width", (width - 23) * onePx + "%");
        }
    });
}

function getChildElements(arr) {
    var array = new Array();
    for (var i = 0; i < arr.length; i++) {
        var line = "",
            type = "",
            comment = "",
            children = null;
        if (arr[i] != null) {
            if (arr[i].line.line != undefined && arr[i].line.line != null) {
                line = arr[i].line.line;
            } else if (arr[i].line != undefined && arr[i].line != null) {
                line = arr[i].line;
            }
            if (arr[i].line.type != undefined && arr[i].line.type != null) {
                type = arr[i].line.type;
            } else if (arr[i].type != undefined && arr[i].type != null) {
                type = arr[i].type;
            }
            if (arr[i].line.comment != undefined && arr[i].line.comment != null) {
                comment = arr[i].line.comment;
            } else if (arr[i].comment != undefined && arr[i].comment != null) {
                comment = arr[i].comment;
            }
            if (arr[i].children != undefined && arr[i].children != null) {
                children = arr[i].children;
            }
        }
        if (type != -1 && line != "" && line != " ") {
            var elem = createElemType(type, line, comment);

            if (arr[i] != null) {
                if (line.indexOf("else") === -1) {
                    if (Array.isArray(children)) {
                        if (children.length > 0) {
                            if (type == 3) {
                                var childArr = getChildElements(children);
                                for (var j = 0; j < childArr.length; j++) {
                                    $(elem).children(".innerElementTable").children(".innerElementCell").first().append(childArr[j]);
                                }
                            } else if (type == 0 || type == 1 || type == 2) {
                                var childArr = getChildElements(children);
                                for (var j = 0; j < childArr.length; j++) {
                                    $(elem).children(".innerElements.innerDroppable").append(childArr[j]);
                                }
                            }
                        }
                    } else {

                    }
                    array.push(elem);
                } else {
                    var lineC;
                    lineC = getClipContent(line, type);
                    var elem = createElemType(type, lineC, comment);
                    if (Array.isArray(children) && children.length > 0) {
                        var childArr = getChildElements(children);
                        for (var j = 0; j < childArr.length; j++) {
                            $(elem).children(".innerElementTable").children(".innerElementCell").last().append(childArr[j]);
                        }
                    }
                }
            } else {

            }
        }
    }
    return array;
}


function getClipContent(string, type) {
    var part = string;
    if (type >= 0 && type <= 4) {
        if (string.indexOf("(") !== -1 && string.indexOf(")")) {
            var len = string.length,
                i = 0,
                start = 0,
                end = 0,
                clips = 0;
            while (i < len) {
                if (string.substring(i, (i + 1)) == '(') {
                    clips++;
                    if (clips == 1) {
                        start = (i + 1);
                    }
                }
                if (string.substring(i, (i + 1)) == ')') {
                    clips--;
                    if (clips == 0) {
                        end = i;
                        break;
                    }
                }
                i++;
            }
            part = string.substring(start, end);
        }
    }
    if (type == 7) {

    }
    return part;
}

function connectParts(parts) {
    var l = parts.length,
        back = "";
    for (var i = 1; i < l; i++) {
        back += parts[i];
    }
    return back;
}

function createElemType(elemType, headerContent, comment) {

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

    $(elemTitle).html(headerContent);
    switch (elemType) {
        case 0:
            $(elem).addClass("elemStruct0");
            //$(elemTitle).html("While-Schlaufe");
            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem);

            dataType = "While-Schlaufe";
            break;
        case 1:
            $(elem).addClass("elemStruct1");

            //$(elemTitle).html("DoWhile-Schlaufe");
            $(headerElem).html("&emsp;");
            $(bottomElem).append(elemTitle);

            $(elem).append(innerElem).append(bottomElem);

            dataType = "DoWhile-Schlaufe";
            break;
        case 2:
            $(elem).addClass("elemStruct2");

            $(headerElem).append(elemTitle);
            $(bottomElem).html("&emsp;");

            $(elem).append(headerElem).append(innerElem);

            dataType = "For-Schleife";
            break;
        case 3:
            $(elem).addClass("elemStruct3");

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
        case 4: //switch

            $(elem).addClass("elemStruct4");


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
        case 5:
            $(elem).addClass("elemStruct5");
            $(elem).attr("engineChecked", "false");
            $(headerElem).append(elemTitle);

            $(elem).append(headerElem);

            dataType = "Anweisung";
            break;
        case 6:
            $(elem).addClass("elemStruct6");
            $(elem).attr("engineChecked", "false");
            $(headerElem).append(elemTitle);

            $(elem).append(headerElem);

            dataType = "Define";
            break;
        case 7:
            $(elem).addClass("elemStruct7");
            $(elem).attr("engineChecked", "false");
            $(headerElem).append($("<div class='beforePart'></div>")).append(elemTitle).append($("<div class='afterPart'></div>"));

            $(elem).append(headerElem);

            dataType = "Funktion";
            break;
        default:
            break;
    }

    $(elem).attr({
        draggable: "true",
        id: "elemStruct" + $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id")).children(".dropZone").children(".elemStruct").length,
        data_type: dataType,
        data_title: headerContent,
        data_description: comment,
        enginechecked: "false"
    }).addClass("draggable");


    return elem;
}


function createArrayOverView() {
    var mainArr = new Array(),
        childArr = new Array(),
        brackets = 0;
    $(".convertCodeToStruct .mainContent .mainContainer .codeContainer .singleLine").each(function() {
        var string = getPureText($(this).text())
        if (string.indexOf("{")) { brackets++; }
        if (string.indexOf("}")) { brackets--; }
        childArr.push(string);
        if (brackets > 0) {
            if ($(this)) {
                console.log(getChildNode($(this)));
            }

        } else {
            mainArr.push(childArr);
            if (childArr.length > 0) {

            }
            childArr = new Array();
        }
    });
    return mainArr;
}

function getChildNode(element) {
    if (!element) {
        return;
    }
    var childArr = new Array(),
        activeChildNode = $(element).next(),
        brackets = 1;

    while (brackets > 0) {
        //var string = getPureText($(activeChildNode).text());
        var string = $(activeChildNode).text();
        if (string.indexOf("}")) { brackets--; }
        if (string.indexOf("{")) {
            childArr.push(getChildNode($(activeChildNode)));
        } else if (brackets > 0) {
            childArr.push(string);
        }
        activeChildNode = $(activeChildNode).next();
    }

    return childArr;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function getPureText(string1) {
    var string = string1;
    string = string.replaceAll(' ', '');
    string = string.replaceAll('<div>', '');
    string = string.replaceAll('&nbsp;', '');
    string = string.replaceAll("&lt;", '<');
    string = string.replaceAll("&gt;", '>');
    string = string.replaceAll("&amp;", '&');

    return string;
}