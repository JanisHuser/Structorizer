
    var customHistoryLog = [],
    customHistoryBindings = [{historyId: null, mainStructId: null}],
    customHistoryPositions = [];

function createNewHistoryLog(mainStructId) {
        customHistoryLog.push([]);
        customHistoryBindings.push({historyId: (customHistoryLog.length-1), mainStructId: mainStructId});
        customHistoryPositions.push([0]);
    }
    function addNewHistoryLog(mainStructId, elemStructId, type, text, parents) {
        for(var i=0; i < customHistoryBindings.length; i++) {
            if( customHistoryBindings[i].historyId == mainStructId ) {
                var historyId = customHistoryBindings[i].historyId;
                customHistoryLog[historyId].push({elemId: elemStructId, type: type, text, text, parens: parents});
                customHistoryPositions[historyId]++;
                
                break;
            }
        }
        
    }
    
    function goHistoryBack(mainStructId) {
        window.setTimeout(function() {
            for(var i=0; i < customHistoryBindings.length; i++) {
                if( customHistoryBindings[i].historyId == mainStructId ) {
                    var historyId = customHistoryBindings[i].historyId;
                    if( customHistoryPositions[historyId] > 0 ) {
                        historyPos = customHistoryLog[historyId][customHistoryPositions[historyId]-1];
                        switch(historyPos.type) {
                            //0=>create, 1=>delete, 2=>moved, 3=>edited
                            case 0:
                                $(".structContent .mainStruct#mainStruct" + mainStructId ).find(".elemStruct#elemStruct"+ historyPos.elemId).remove();
                            break;
                            case 1: break;
                            case 2: break;
                            case 3: break;
                        }
                        customHistoryPositions[historyId]--;
                    }
                }
            }
        },250);
    }

    function goHistoryForward(mainStructId) {
        window.setTimeout(function() {
            for(var i=0; i < customHistoryBindings.length; i++) {
                if( customHistoryBindings[i].historyId == mainStructId ) {
                    var historyId = customHistoryBindings[i].historyId;
                    if( customHistoryPositions[historyId] < customHistoryLog[historyId].length ) {
                        historyPos = customHistoryLog[historyId][customHistoryPositions[historyId]];
                        switch(historyPos.type) {
                            //0=>create, 1=>delete, 2=>moved, 3=>edited
                            case 0:
                                $(".structContent .mainStruct#mainStruct" + mainStructId ).find(".elemStruct#"+ historyPos.elemId).remove();
                            break;
                            case 1: break;
                            case 2: break;
                            case 3: break;
                        }
                        customHistoryPositions[historyId]--;
                    }
                }
            }
        },250);
    }
