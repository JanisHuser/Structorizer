var createImage = function(context) {
    if (this.__proto__.constructor !== createImage) {
        return new createImage(context);
    }
    this.context = context;


    this.getInterface = function() {
        var parent = document.createElement("div"),
            content = document.createElement("div"),
            header = document.createElement("div"),
            headerText = document.createElement("div"),
            contentDiv = document.createElement("div"),
            contentDivSelectTable = document.createElement("table"),
            contentDivSelectTableHeader = document.createElement("tr"),
            contentDivSelectTableHeaderSelect = document.createElement("th"),
            contentDivSelectTableHeaderSelectInput = document.createElement("input"),
            contentDivSelectTableHeaderTitle = document.createElement("th");

        contentDivSelectTableHeader.classList.add("tableHeader");
        var contentLogic = document.createElement("div"),
            contentLogicAccept = document.createElement("div"),
            contentLogicAbort = document.createElement("div");

        contentLogicAccept.appendChild(document.createTextNode("Bild erstellen"));
        contentLogicAbort.appendChild(document.createTextNode("Abbrechen"));
        contentLogicAccept.classList.add("contentLogicAccept");
        contentLogicAbort.classList.add("contentLogicAbort");
        contentLogic.classList.add("contentLogic");

        contentLogic.appendChild(contentLogicAccept);
        contentLogic.appendChild(contentLogicAbort);

        contentDivSelectTableHeaderSelect.classList.add("selectOption");
        contentDivSelectTableHeaderSelectInput.setAttribute("type", "checkbox");

        contentDivSelectTable.classList.add("structsTable");
        contentDivSelectTableHeaderSelect.appendChild(contentDivSelectTableHeaderSelectInput);
        contentDivSelectTableHeaderTitle.appendChild(document.createTextNode("Titel:"));
        contentDivSelectTableHeader.appendChild(contentDivSelectTableHeaderSelect);
        contentDivSelectTableHeader.appendChild(contentDivSelectTableHeaderTitle);

        contentDivSelectTable.appendChild(contentDivSelectTableHeader);

        for (var i = 0; i < document.querySelectorAll(".structContent .mainStruct").length; i++) {
            var contentDivSelectTableItem = document.createElement("tr"),
                contentDivSelectTableItemSlot1 = document.createElement("td"),
                contentDivSelectTableItemSlot2 = document.createElement("td");

            contentDivSelectTableItemSlot1.classList.add("selectOption");
            var inputElemSingle = document.createElement("input");
            inputElemSingle.setAttribute("type", "checkbox");
            contentDivSelectTableItemSlot1.appendChild(inputElemSingle);

            contentDivSelectTableItemSlot2.appendChild(document.createTextNode(document.querySelectorAll(".structContent .mainStruct")[i].getElementsByClassName("mainStructHeader")[0].getElementsByClassName("title")[0].innerHTML));



            contentDivSelectTableItem.appendChild(contentDivSelectTableItemSlot1);
            contentDivSelectTableItem.appendChild(contentDivSelectTableItemSlot2);

            contentDivSelectTableItem.setAttribute("mainStructId", document.querySelectorAll(".structContent .mainStruct")[i].getAttribute("id"));
            contentDivSelectTable.appendChild(contentDivSelectTableItem);
        }

        headerText.classList.add("text");
        header.classList.add("header");
        content.classList.add("contentDiv");
        parent.classList.add("selectStructsDiv");
        contentDiv.classList.add("container");

        headerText.appendChild(document.createTextNode("Struktogramme auswählen:"));
        header.appendChild(headerText);
        contentDiv.appendChild(contentDivSelectTable);
        content.appendChild(header);
        content.appendChild(contentDiv);
        content.appendChild(contentLogic);

        //advanced settings expand
        var advancedDiv = document.createElement("div"),
        advancedDivHeader = document.createElement("div"),
        advancedDivHeaderText = document.createElement("div"),
        advancedDivHeaderExpand = document.createElement("div"),
        advancedDivContent = document.createElement("div");

        advancedDiv.classList.add("advancedDiv");
        advancedDivHeaderText.appendChild(document.createTextNode("Erweitert"));
        advancedDivHeaderExpand.classList.add("expand");
        advancedDivHeader.classList.add("headerDiv");
        advancedDivHeaderText.classList.add("headerDivText");
        advancedDivContent.classList.add("advancedDivContent");

        advancedDivHeader.appendChild(advancedDivHeaderText);
        advancedDivHeader.appendChild(advancedDivHeaderExpand);

        //advanced Div Content
        advancedDiv.appendChild(advancedDivHeader);
        advancedDiv.appendChild(advancedDivContent);

        //content.appendChild(advancedDiv);
        parent.appendChild(content);

        
       

        document.body.appendChild(parent);
    }

    this.getImage = function(area, callback) {
        
        var height = document.querySelectorAll(area)[0].offsetHeight,
        width = document.querySelectorAll(area)[0].offsetWidth;

        var canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        var ctx = canvas.getContext("2d");
        var ar = new Array();
        ar = getLines(ar, document.querySelectorAll(area)[0]);
        console.log(ar);
    }


    $(document).on("click", ".selectStructsDiv .contentDiv .container .structsTable tr.tableHeader .selectOption input[type=checkbox]", function() {
        
        var items =  document.querySelectorAll(".selectStructsDiv .contentDiv .container .structsTable tr:not(.tableHeader)");
        for(var i=0; i < items.length; i++ ) {
            
            items[i].getElementsByClassName("selectOption")[0].children.item(0).checked = document.querySelector(".selectStructsDiv .contentDiv .container .structsTable tr.tableHeader .selectOption input[type=checkbox]").checked;
        }
    });
    

     $(document).on("click", ".selectStructsDiv .contentDiv .advancedDiv .headerDiv", function() {
         $(this).parent().toggleClass("active");
     });
     
     function getElementStyle(element, canvas, Y, X, width) {
        var ctx = canvas.getContext("2d");

        ctx.font = "16px Arial";
        var Ycpy = Y;

        /*
        if( element.classList.contains("elemStruct0")) {
            console.log("0");
            ctx.moveTo(X+16, Y+0.5);
            ctx.lineTo(width, Y+0.5);
            ctx.stroke();
            Y += 20;
            ctx.fillText(element.getAttribute("data_title"))
            


            //while loop
        } else if( element.classList.contains("elemStruct1")) {
            //doWhile loop
        } else if( element.classList.contains("mainStruct2")) {
            //for loop
        } else if( element.classList.contains("mainStruct3")) {
            //if- else
        } else if( element.classList.contains("mainStruct4")) {
            //switch
        } else if( element.classList.contains("mainStruct5")) {
            //anweisung
        } else if( element.classList.contains("mainStruct6")) {
            //define
        } else if( element.classList.contains("mainStruct7")) {
            //funktion
        }
        if( element.getElementsByClassName("innerElements").length > 0) {//has Children & is not if or switch
            if( element.getElementsByClassName("innerElements")[0].children.length > 0 ) {

            }
        }
            
        if( element.getElementsByClassName("innerElementTable").length > 0) { //has Children & is if or switch
            if( element.getElementsByClassName(".innerElementTable")[0].getElementsByClassName(".innerElementCell").length > 0 ){
            
            }
        }
        return canvas;
    }*/
    }
    function getLines(ar, el) {
        var i=0;
        if( el ) {
            while( i < el.childNodes.length ) {
                var opts = new Array();
                ar = getLines(ar,el.childNodes[i]);

                opts.push(el.childNodes[i].offsetLeft);
                opts.push(el.childNodes[i].offsetTop);
                opts.push(el.childNodes[i].offsetWidth);
                opts.push(el.childNodes[i].offsetHeight);
                ar.push(opts);

                i++;
            }
        }
        return ar;
    }
}