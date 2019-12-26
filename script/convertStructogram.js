
function openStructogramm(fileContext, fileType) {
   
        $(".structContent").html("");
        switch(fileType) {
            case "structio":        //this structorizer => pure html
            var split3 = fileContext.split("mainStructHeaderCompleteLoad:{");
            for( var i=1; i < split3.length; i++ ) {
                $(".structContent").append((split3[i].split("}")[0]));

                var title = $(split3[i].split("}")[0]).find(".mainStructHeader .title").html();
                if( i > 1) {
                var c1 = $("<div class='text'>" + title + "</div>"),
                    c2 = $("<div class='close'>x</div>"),
                    elem = $("<div class='tabItem'></div>");

                    $(elem).append(c1).append(c2);
                    $(elem).attr("id", $(".tabItem").length);
                    $(".structTabs .openNewTab").before(elem);
                } else {
                    $(".structTabs .tabItem#0 .text").html(title);
                }
            }
            
            break;
            case "7":               //Struktogrammeditor 1.7 => xml
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(fileContext,"text/xml");

            $(xmlDoc).find("struktogramm").each(function() {
                $(this).find("strelem").each(function() {
                    var type = $(this).attr("typ");
                    var text = $(this).find("text").text();
                    var stringText = "";
                    for(var i=0; i < text.split(";").length; i++ ) {
                        stringText += String.fromCharCode(text.split(";")[i]);
                    }
                    
                    createElement();
                });
            });

            break;
            case "nsd":             //Structorizer 3.26 => xml

            break;
        }
        $(".structTabs .tabItem#0").click();
    }
    /* structorizer */
    //0 => while loop
    //1 => DoWhile loop
    //2 => For Loop
    //3 => if else
    //4 => switch
    //5 => anweisung
    //6 => define
    //7 => funktion

    /* struktogrammeditor 1.7 */
    //0 => anweisung
    //1 => if else => true (fall, text=fallname), false (fall, text=fallname)
    //2 => switch
    //3 => for loop => schleifeninhalt
    //4 => while loop => schleifeninhalt
    //5 => DoWhile loop => schleifeninhalt
    //6 => endless loop => schleifeninhalt
    //7 => aussprung
    //8 => funktion
    //9 => empty

    //fall => entscheidung
    //schleifeninhalt => inhalt der schleife


    /* structorizer 3_26 */
    //title root => text
    //=> children
    //instruction text=text, comment=comment
    //alternative (ifelse) => true(qTrue), false(qFalse)
    //case (switch) comment=comment
        //text=""bedingung", "opt1","opt2""
    //for (foorLoop) text=text, comment=comment, counterVar=counterVar, startValue=startValue, stepCnst=stepCnst
        //qFor
    //repeat (dowhile) text=textm comment=comment
        //qRepeat
    //forever 
        //qForever
    //call
    //jump