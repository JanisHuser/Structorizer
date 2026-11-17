var customHistoryLog = [],
    customHistoryBindings = [{ historyId: null, mainStructId: null }],
    customHistoryPositions = [];

function createNewHistoryLog(mainStructId) {
    customHistoryLog.push([]);
    customHistoryBindings.push({ historyId: (customHistoryLog.length - 1), mainStructId: mainStructId });
    customHistoryPositions.push([0]);
}

function AddLog(mainStructId) {
    var mainStruct = $(".mainStruct#mainStruct" + mainStructId);
    if (mainStruct.css("display") == "block") {
        for (var i = 0; i < customHistoryBindings.length; i++) {
            if (customHistoryBindings[i].historyId == mainStructId) {
                var historyId = customHistoryBindings[i].historyId;
                if (customHistoryLog[historyId][customHistoryPositions[historyId]] != mainStruct.html()) {
                    if (customHistoryPositions[historyId] < customHistoryLog[historyId].length) {
                        customHistoryLog[historyId].splice(customHistoryPositions[historyId], customHistoryLog[historyId].length - 1);
                    }
                    customHistoryLog[historyId].push(mainStruct.html());
                    customHistoryPositions[historyId]++;

                }
                break;
            }
        }
    }
}


function goHistoryBack(mainStructId) {
    for (var i = 0; i < customHistoryBindings.length; i++) {
        if (customHistoryBindings[i].historyId == mainStructId) {
            var historyId = customHistoryBindings[i].historyId;
            if (customHistoryPositions[historyId] > 0) {
                historyPos = customHistoryLog[historyId][customHistoryPositions[historyId] - 1];
                customHistoryPositions[historyId]--;
                return historyPos;
            }
        }
    }
}

function goHistoryForward(mainStructId) {
    for (var i = 0; i < customHistoryBindings.length; i++) {
        if (customHistoryBindings[i].historyId == mainStructId) {
            var historyId = customHistoryBindings[i].historyId;
            if (customHistoryPositions[historyId] < customHistoryLog[historyId].length) {
                historyPos = customHistoryLog[historyId][customHistoryPositions[historyId]];

                customHistoryPositions[historyId]++;

                return historyPos;

            }
        }
    }
}

function canGoBack(mainStructId) {
    for (var i = 0; i < customHistoryBindings.length; i++) {
        if (customHistoryBindings[i].historyId == mainStructId) {
            var historyId = customHistoryBindings[i].historyId;
            if (customHistoryPositions[historyId] > 0) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function canGoForward(mainStructId) {
    for (var i = 0; i < customHistoryBindings.length; i++) {
        if (customHistoryBindings[i].historyId == mainStructId) {
            var historyId = customHistoryBindings[i].historyId;
            if (customHistoryPositions[historyId] < customHistoryLog[historyId].length) {
                return true;
            } else {
                return false;
            }
        }
    }
}