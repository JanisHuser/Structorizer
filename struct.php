<!DOCTYPE HTML>
<html lang="ch-de">
<!--
	COPYRIGHT 2017 - Janis Huser, Alle Rechte vorbehalten.
-->

<head>
	<meta charset="UTF-8">
    <link rel="stylesheet" href="styles/styleElements.css" />
    <link rel="stylesheet" href="styles/generall.css" />
    <link rel="stylesheet" href="styles/overview.css" />
    <link rel="stylesheet" href="styles/documentation.css" />
    <link rel="stylesheet" href="styles/customElements.css" />
    <link rel="stylesheet" href="styles/createPicture.css" />
    <link rel="stylesheet" href="styles/codeToStruct.css" />
    <link rel="stylesheet" href="styles/informationDiv.css" />
	<link rel="stylesheet" href="styles/firstVisit.css" />
	<link rel="stylesheet" href="styles/elemInformations.css" />
    <title>Structorizer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1 user-scalable=0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="script/createElem.js?version=1.0" type="text/javascript"></script>
    <script src="script/engine.js?version=1.0" type="text/javascript"></script>
    <script src="script/informationDiv.js" type="text/javascript"></script>
    <script src="script/createOverview.js" type="text/javascript"></script>
    <script src="script/historyAPI.js" type="text/javascript"></script>
    <script src="script/convertStructogram.js" type="text/javascript"></script>
    <script src="script/simulation.js" type="text/javascript"></script>
    <script src="script/createImage.js" type="text/javascript"></script>
    <script src="script/languages.js" type="text/javascript"></script>
    <script src="script/mainTools.js" type="text/javascript"></script>
    <script src="script/codeToStruct.js" type="text/javascript"></script>
    <!-- export to pdf scripts-->
    <script src="script/jspdf.js" type="text/javascript"></script>
    <script src="script/from_html.js" type="text/javascript"></script>
    <script src="script/split_text_to_size.js" type="text/javascript"></script>
    <script src="script/standard_fonts_metrics.js" type="text/javascript"></script>
    <script src="script/downloadStruct.js" type="text/javascript"></script>
    <script src="script/domToImage.js" type="text/javascript"></script>
    <link rel="icon" href="favicon.png">
	<script type="text/javascript">
	function googleTranslateElementInit() {
		new google.translate.TranslateElement({pageLanguage: 'de', autoDisplay: false}, 'google_translate_element');
		setTimeout(function(){
			$(".skiptranslate goog-te-gadget:nth-child(1)").remove();
		}, 2500);
	}
	</script><script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
	<style>
		body {
			overflow: hidden;
		}
	</style>
    <script>
        var GlobalSettings = {
            fastEditMode: false
        }
        var customId = 1;
        var simulationActive = false;


        var historyLog = [],
            historyPos = 0;

        $(document).ready(function() {
			
			
			
			
			if (window.location.href.indexOf('http://')==0){
				window.location.href = window.location.href.replace('http://','https://');
			}
			if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1))
			{
				$(".browserBlock").show();
			}
			
			$.ajaxSetup({
					xhr: function(){
						var xhr = new window.XMLHttpRequest();
						//Upload progress
						xhr.upload.addEventListener("progress", function(evt){
							if (evt.lengthComputable) {
								var percentComplete = evt.loaded / evt.total;
								$(".loadingBar .loadedPart").show();
								$(".loadingBar .loadedPart").css("width", (percentComplete*100) + '%');
							}
						}, false);
						//Download progress
						xhr.addEventListener("progress", function(evt){
							if (evt.lengthComputable) {
								var percentComplete = evt.loaded / evt.total;
								$(".loadingBar .loadedPart").show();
								$(".loadingBar .loadedPart").css("width", (percentComplete*100) + '%');
							}
						}, false);
						//Loaded complete
						xhr.addEventListener("load", function(evt) {
							$(".loadingBar .loadedPart").hide();
						}, false);
						return xhr;
					},
					type: 'POST',
					url: "/",
					data: {},
					async: 'true',
					success: function(data){
						console
						$(".loadingBar .loadedPart").hide();
					}
				});

            var tools_PaintToolActive = false,
                tools_PaintToolActiveColor = null;


            createNewHistoryLog($(".structTabs .tabItem.active").attr("id"));
            var elemInformation = {
                elemNr: null,
                elemText: null,
                elemBColor: null
            };
            var activeDrag = null;


            var controls_cuttedElement = null;

            $(document).on("dragstart", ".createElem", function(e) {
                elemInformation.elemNr = $(this).attr("elemId");
                elemNotDropped = true;
				e.originalEvent.dataTransfer.setData('text/plain', 'anything');
            });

            $(document).on("dragend", ".createElem", function(e) {
                $(".insertBefore .dropZoneBefore").each(function() {
                    if ($(this).children().length == 0) {
                        $(this).parent().remove();
                    }
                });
                $(".insertAfter .dropZoneAfter").each(function() {
                    if ($(this).children().length == 0) {
                        $(this).parent().remove();
                    }
                });

            });

            $(document).on("dragover", ".innerDroppable, .dropZoneBefore, .dropZoneAfter", function(e) {
                e.preventDefault();
                e.stopPropagation();

            });


            $(document).on("dragover", ".elemStruct", function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (!$(this).prev().hasClass("insertAfter") && !$(this).prev().hasClass("insertBefore") && !$(e.target).hasClass("deleteSection")) {
                    $(this).before($("<div class='insertBefore'></div>"));
                }
                if (!$(this).next().hasClass("insertAfter") && !$(this).next().hasClass("insertBefore") && !$(e.target).hasClass("deleteSection")) {
                    $(this).after($("<div class='insertAfter'></div>"));
                }
            });

            $(document).on("dragleave", ".elemStruct", function(e) {
                e.preventDefault();
                e.stopPropagation();
            });



            $(document).on("drop", ".innerDroppable, .insertBefore, .insertAfter", function(e) {
                if (activeDrag == null) { //create new Element
                    createElement(this, customId, elemInformation.elemNr);
                    activeDrag = null;

                    if (GlobalSettings.fastEditMode == true) {
                        $(".elemStruct .elemHeader .elemTitle").addClass("editable").attr("contenteditable", "true");
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
                } else { //element is moved
                    if (elemNotDropped) {
						var elemParent = $(this).parent(), foundParent = false;
						while($(elemParent).length > 0 && !foundParent) {
							if($(elemParent).attr("id") == activeDrag)
								foundParent = true;
							elemParent = $(elemParent).parent();
						}
                        if (!foundParent) {
                            if ($(this).hasClass("insertBefore") && $(this).parent().prev().attr("id")) {
								
								var elem = $("#" + activeDrag).detach();
								if($(e.target).next() ) {
									if($(this).next().attr("id") != activeDrag) {
										$(this).next(".innerDroppable").before(elem);
									}
								} else {
									
									$(this).next().prepend(elem);
								}
                            } else if ($(this).hasClass("insertAfter") && $(this).next().attr("id") != activeDrag) {
								if($(this).next().attr("id") != activeDrag) {
									var elem = $("#" + activeDrag).detach();
									if($(this).prev()) {
										if($(this).prev().attr("id") != activeDrag) {
											$(this).prev().after(elem);
										}
									} else {
										$(this).parent().append(elem);
									}
								}
                            } else if ($(this).hasClass("innerDroppable")) {
								if($(this).parent().attr("id") != activeDrag && $(this).parent().parent().attr("id") != activeDrag) {
									var elem = $("#" + activeDrag).detach();
									$(this).append(elem);
								}
                            }

                        }
                    }
					elem = null;
					activeDrag = null;
                }
                elemNotDropped = false;
                $(".elemStruct").css({
                    backgroundColor: ""
                });


                e.stopPropagation();
                e.preventDefault();
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
				
				$(".navigation .itemSection,.navigation .itemSectionHeader, .navigation .itemSection .itemSectionContent").css({
                    opacity: '1'
                });
                $(".navigation .deleteSection, .navigation .itemSection.itemSectionBottom").css({
                    opacity: '1'
                });

            });
            var recentHistoryChanged = false;

            window.setInterval(function() {
                if (recentHistoryChanged) {
                    recentHistoryChanged = false;
                }
            }, 150);

            var htmlCpy = $(".structContent").html();
			
			var autoSaveCnt = 0;
            window.setInterval(function() {
                if ($(".structContent").html() != htmlCpy && $(".insertBefore").length == 0 && $(".insertAfter").length == 0 && !recentHistoryChanged) {
                    AddLog($(".structTabs .tabItem.active").attr("id"));
					$(".menuBar").addClass("notSaved");
                    htmlCpy = $(".structContent").html();
					if( autoSaveCnt >= 24000) {
						saveProject();
						autoSaveCnt = 0;
					}
				}
				autoSaveCnt++;
            }, 50);
				
			
			window.setInterval(function() {
				$(".messageBoxMain").find(".singleMessage").each(function() {
					if($(this).attr("sTime") < (new Date().getTime()-2000)) {
						$(this).remove();
					}
				});
			},80000);

            $(document).on("click", ".innerElementCell", function(e) {
                $(".innerElementCell").trigger("withChange");
                var nextElemsAmount = $(e.target).parent().children(".innerElementCell").length;
                var thisWidth = $(e.target).css("width");
                var maxWidth = $(e.target).parent().css("width");
                var toSetWidth = parseInt(parseInt(maxWidth - thisWidth) / nextElemsAmount - 1);

                $(this).closest().siblings(".innerElementCell").css("width", parseInt(toSetWidth) + 'px');
                console.log(parseInt(thisWidth));
            });

            $(document).on("mousedown", ".innerDroppable", function(e) {
                if ($(e.target).hasClass("innerDroppable")) {
                    e.preventDefault();
                }
            });
            $(document).on("dragstart", ".elemStruct", function(e) {
                elemNotDropped = true;
                activeDrag = $(e.target).attr("id");
                $(".navigation .itemSection,.navigation .itemSectionHeader, .navigation .itemSection .itemSectionContent").css({
                    opacity: '0.4'
                });
                $(".navigation .deleteSection, .navigation .itemSection.itemSectionBottom").css({
                    opacity: '1'
                });
                e.stopPropagation();
				e.originalEvent.dataTransfer.setData('text/plain', 'anything');
            });



            $(document).on("dragover", ".header", function(e) {
                e.stopPropagation();
            });
			
            $(document).on("dragleave", ".header", function(e) {
                e.stopPropagation();
            });

            $(document).on("drop dragend", function(e) {
                activeDrag = null;
                $(".elemStruct").css("background-color", "white");
                $(".navigation .itemSection,.navigation .itemSectionHeader, .navigation .itemSectionContent").css({
                    opacity: '1'
                });
                $(".navigation .deleteSection, .navigation .itemSection.itemSectionBottom").css({
                    opacity: '1'
                });
                if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                    $("#goBack").removeClass("inActive");
                } else {
                    $("#goBack").addClass("inActive");
                }
                if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                    $("#goForward").removeClass("inActive");
                } else {
                    $("#goForward").addClass("inActive");
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
            });



            $(document).on("drop", ".deleteSection", function(e) {
                e.stopPropagation();
                if (!$("#" + activeDrag).hasClass("informationHeader")) {
                    $("#" + activeDrag).remove();
                    $(this).removeClass("onHoverActive");
                }
                activeDrag = null;
                $(".navigation .itemSection,.navigation .itemSectionHeader, .navigation .itemSectionContent").css({
                    opacity: '1'
                });
                $(".navigation .deleteSection, .navigation .itemSection.itemSectionBottom").css({
                    opacity: '1'
                });

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
            });

            $(document).on("dragover", ".deleteSection", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).addClass("onHoverActive");
            });

            $(document).on("dragleave", ".deleteSection", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass("onHoverActive");
            });

            $(".itemSave").click(function(e) {
                $(".saveDialog .saveDialogContent .saveDialogContentCode").text($(".mainStruct")[0].outerHTML);
                $(".saveDialog").show();
            });
			
            $(document).on("click", ".saveDialog", function(e) {
                if ($(e.target).hasClass("saveDialog")) {
                    $(".saveDialog").hide();
                }
            });
			
            var template = "<div class='mainStruct'><div class='informationHeader elemHeader' draggable='false' id='elemStruct0' data_title='noTitle' data_elements='0' data_version='0' data_type='Hauptstruktogram' data_description=''>header</div><div class='innerElements innerDroppable'></div></div>";
			
            $(".dropDownOption").click(function() {
                if (!$(this).hasClass("inActive")) {
                    $(".dropDownContent").hide();
                    switch ($(this).attr("id")) {
                        case "item1":  //Datei öffnen
                            $(".structContent")[0].innerHTML = template;
                            break;
							
                        case "item2": //Speichern
                            $(".openFileDialog").click();
                            break;
							
                        case "item3": //speicher unter
                            var content = "";
                            var mainStructs = document.querySelectorAll(".mainStruct");
                            for (var i = 0; i < mainStructs.length; i++) {
                                content += "mainStructHeaderCompleteLoad:{";
                                content += mainStructs[i].outerHTML;
                                content += "}";
                            }
                            var filename = window.localStorage.getItem("projectTitle") + ".structIo";
                            download(filename, content);
                            break;
                            
                        case "item4":
                            createImage().getInterface();
                            break;
							
                        case "viewOverview": //show Overview
                            overView().createOverview();
							$(".navigation").css({
								width: "0",
								marginLeft: "0",
								overflowY: "hidden"
							}).attr("title", "Menu vergrössern");
							$(".navigation .navigationContent div:not(.navigationToggle)").css({
								width: "0",
								marginLeft: "0"
							});
							$(".navigation .navigationContent").css("overflow", "auto");
							$(".simulationTools").remove();
                            break;
							
                        case "viewEditMode": //show editMode
                            $(".structTabs").show().delay(10);
                            $(".navigation").css({
								width: "250px",
								marginLeft: "250xpx",
								overflowY: "auto"
							}).attr("title", "Menu verkleinern");
							$(".navigation .navigationContent div:not(.navigationToggle)").css({
								width: "245px",
								marginLeft: "245xpx"
							});
							$(".navigation .navigationContent").css("overflow", "hidden");
                            $(".structContent").show() //show edit mode from diagram
							$(".simulationTools").remove();
                            $(".mainOverview").remove(); //remove Overview
                            break;
							
                        case "onOffFastEditMode":
                            if (GlobalSettings.fastEditMode == false) {
                                $(".elemStruct .elemHeader .elemTitle, .mainStructHeader .title").addClass("editable").attr("contenteditable", "true");
                                GlobalSettings.fastEditMode = true;
                                $("#onOffFastEditMode .text").html("Fastedit mode deaktivieren");
                            } else {
                                $(".elemStruct .elemHeader .elemTitle, .mainStructHeader .title").removeClass("editable").attr("contenteditable", "false");
                                GlobalSettings.fastEditMode = false;
                                $("#onOffFastEditMode .text").html("Fastedit mode aktivieren");
                            }
                            break;
							
                        case "startStopSimulation":
                            if ($(this).hasClass("active")) {
                                $(this).removeClass("active");
								$(".normalView").css({
									marginLeft: "0",
									width: "100%",
									overflow: "",
									display: "inline-block"
								});
								$(".simulationPage").css({
									position: "absolute",
									overflow: "",
									width: "0px",
									marginLeft: "100%",
									display: "inline-block"
								});
								window.setTimeout(function() {
									$(".simulationPage").remove();
								}, 400);
                                simulationActive = false;
                            } else {
                                $(this).addClass("active");
								$(".navigation .navigationContent").css("overflow", "auto");
                                simulation().createLayout();
                                simulation().getSteps();
                                simulationActive = true;
                            }
                            break;
							
                        case "goBack":
                            $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id")).html(goHistoryBack($(".structTabs .tabItem.active").attr("id")));
                            recentHistoryChanged = true;
                            if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                                $("#goBack").removeClass("inActive");
                            } else {
                                $("#goBack").addClass("inActive");
                            }
                            if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                                $("#goForward").removeClass("inActive");
                            } else {
                                $("#goForward").addClass("inActive");
                            }
                            break;
							
                        case "goForward":
                            $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id")).html(goHistoryForward($(".structTabs .tabItem.active").attr("id")));
                            if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                                $("#goBack").removeClass("inActive");
                            } else {
                                $("#goBack").addClass("inActive");
                            }
                            if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                                $("#goForward").removeClass("inActive");
                            } else {
                                $("#goForward").addClass("inActive");
                            }
                            break;
							
                        case "codeToStruct":
                            $(".convertCodeToStruct").show();
							$(".convertCodeToStruct>.mainContent>.mainContainer>.codeContainer>.singleLine:not(:first-child)").remove();
                            break;
							
						case "shareProject":
							saveProject();
							$(".shareStructCodeToSend").html(getProjectCode());
							$(".shareStructCodeWebSite").html("https://www.structorizer.com/loadStruct/?structCode=" + getProjectCode());
							$(".shareStructCodeWebsiteHref").attr("href", "https://www.structorizer.com/loadStruct/?structCode=" + getProjectCode());
							$(".shareStruct").show();	
							break;
							
						case "openInfoSite":
							$(".infoSite").show();
							break;
							
						case "item6":
							$(".customSettings").show();
							break;
							
						case "itemExportPNG":
							exportAs(0);
							break;
							
						case "itemExportJPG":
							exportAs(1);
							break;
                    }
                    $(".menuBar .dropDownDiv .titleButton").removeClass("active");
                }
            });

			
			
			window.onbeforeunload = function () {
				saveProject();
				setToOpenProject();
			};

            $(".openFileDialog").change(function() {
                var file = document.getElementById("openFileDialog").files[0];
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function(evt) {
					openStructogramm(evt.target.result, "structio");
                }
                reader.onerror = function(evt) {
                    alert("error loading struct, try again later!");
                }
            });
			
            var strutcTabLength = 1;
            $(".structTabs .openNewTab").click(function() {
                var c1 = $("<div class='text'>unnamed</div>"),
                    c2 = $("<div class='close'>x</div>"),
                    elem = $("<div class='tabItem'></div>");
                $(elem).append(c1).append(c2);
                $(elem).attr("id", strutcTabLength);
                createNewDiagram(strutcTabLength);
                $(".structTabs .openNewTab").before(elem);
                $(".structTabs .tabItem#" + (strutcTabLength)).click();
                createNewHistoryLog(strutcTabLength);
                strutcTabLength++;
            });

            $(document).on("click", ".structTabs .tabItem .close", function(e) {
                if ($(this).parent().hasClass("active")) {
                    $(this).parent().prev().click();
                }
                $(".structContent .mainStruct#mainStruct" + $(this).parent().attr("id")).remove();
                $(this).parent().remove();
            });
			
            $(document).on("click", ".structTabs .tabItem", function(e) {
                if (!$(e.target).hasClass("close")) {
                    $(".structTabs .tabItem").removeClass("active");
                    $(this).addClass("active");
                    $(".structContent .mainStruct").hide();
                    $(".structContent .mainStruct#mainStruct" + $(this).attr("id")).show();
                }
            });
            $(document).click(function(event) {
                if (!$(event.target).is(".menuBar, .dropDownDiv, .titleButton, .DropDownContent, .dropDownOption")) {
                    $(".dropDownContent").hide();
                    $(".menuBar .dropDownDiv .titleButton").removeClass("active");
                }
				$(".customContextMenu").hide();
            });
			

			
            var keyPressed = {};
            document.addEventListener('keydown', function(e) {
                keyPressed[e.keyCode] = true;
            }, false);
            document.addEventListener('keyup', function(e) {
                keyPressed[e.keyCode] = false;
            }, false);

            document.onkeydown = function(e) {
                e = e || window.event; //Get event
                if (e.ctrlKey) {
                    var c = e.which || e.keyCode; //Get key code
                    switch (c) {
                        case 83: //Block Ctrl+S
                            e.preventDefault();
                            e.stopPropagation();
                            break;
							
                        case 87: //Block Ctrl+W --Not work in Chrome
                            e.preventDefault();
                            e.stopPropagation();
                            break;
							
                        case 65: //mark all
                            $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id") + " .elemStruct").each(function() {
                                $(this).addClass("selectedActive");
                            });
                            e.preventDefault();
                            e.stopPropagation();
                            break;
							
                        case 73: //fast mode
                            if (GlobalSettings.fastEditMode == false) {
                                $(".elemStruct .elemHeader .elemTitle, .mainStruct .mainStructHeader .title").addClass("editable").attr("contenteditable", "true");
                                GlobalSettings.fastEditMode = true;
                            } else {
                                $(".elemStruct .elemHeader .elemTitle, .mainStruct .mainStructHeader .title").removeClass("editable").attr("contenteditable", "false");
                                GlobalSettings.fastEditMode = false;
                            }
                            e.preventDefault();
                            e.stopPropagation();
                            break;
                    }
                }
                if (keyPressed[98] && simulationActive == true) {
                    simulation().singleStepForward();
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (keyPressed[99] && simulationActive == true) {
                    simulation().singleStepBackWards();
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                    $("#goBack").removeClass("inActive");
                } else {
                    $("#goBack").addClass("inActive");
                }
                if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                    $("#goForward").removeClass("inActive");
                } else {
                    $("#goForward").addClass("inActive");
                }
                //go back in history
                if (keyPressed[17] && keyPressed[90]) {
                    $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id")).html(goHistoryBack($(".structTabs .tabItem.active").attr("id")));
                    recentHistoryChanged = true;
                    if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                        $("#goBack").removeClass("inActive");
                    } else {
                        $("#goBack").addClass("inActive");
                    }
                    if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                        $("#goForward").removeClass("inActive");
                    } else {
                        $("#goForward").addClass("inActive");
                    }
                }
                //go Forward in history
                if (keyPressed[17] && keyPressed[89]) {
                    $(".mainStruct#mainStruct" + $(".structTabs .tabItem.active").attr("id")).html(goHistoryForward($(".structTabs .tabItem.active").attr("id")));
                    if (canGoBack($(".structTabs .tabItem.active").attr("id"))) {
                        $("#goBack").removeClass("inActive");
                    } else {
                        $("#goBack").addClass("inActive");
                    }
                    if (canGoForward($(".structTabs .tabItem.active").attr("id"))) {
                        $("#goForward").removeClass("inActive");
                    } else {
                        $("#goForward").addClass("inActive");
                    }
                }
            };
            $(document).on("click", ".menuBar .dropDownDiv .titleButton", function() {
                if (!$(this).hasClass("active")) {
                    $(".menuBar .dropDownDiv .titleButton").removeClass("active");
                    $(this).addClass("active");
                    $(".menuBar .dropDownDiv .dropDownContent").hide();
                    $(this).parent().children(".dropDownContent").show();
                } else {
                    $(".menuBar .dropDownDiv .titleButton").removeClass("active");
                    $(this).parent().children(".dropDownContent").toggle();
                }
            });

			

            $(document).on("click", ".informationDiv .informationContent .characteristicsDiv .header", function(e) {
                if ($(this).parent().hasClass("expand")) {
                    $(".informationDiv .informationContent .characteristicsDiv .characteristicsDivContent").slideUp(100);
                    $(".informationDiv .informationContent .characteristicsDiv").removeClass("expand");
                } else {
                    $(".informationDiv .informationContent .characteristicsDiv").removeClass("expand");
                    $(".informationDiv .informationContent .characteristicsDiv .characteristicsDivContent").slideUp(100);
                    $(this).parent().children(".characteristicsDivContent").slideDown(100);
                    $(this).parent().addClass("expand");
                }
                e.stopPropagation();
            });

            $(".navigation .navigationToggle").click(function() {
                if ($(".navigation").hasClass("slideToggle")) {
					$(".navigation").css({
						width: "250px",
						marginLeft: "250xpx",
						overflowY: "auto"
					}).attr("title", "Menu verkleinern");
					$(".navigation .navigationContent div:not(.navigationToggle)").css({
						width: "245px",
						marginLeft: "245xpx"
					});
					$(".navigation .navigationContent").css("overflow", "hidden");
                } else {
					$(".navigation").css({
						width: "60px",
						marginLeft: "0",
						overflowY: "hidden"
					}).attr("title", "Menu vergrössern");
					$(".navigation .navigationContent div:not(.navigationToggle)").css({
						width: "60px",
						marginLeft: "0"
					});
					$(".navigation .navigationContent").css("overflow", "auto");
                }
				$(".navigation").toggleClass("slideToggle");

            });

            $(document).on("keydown, keyup", ".elemStruct .elemHeader .elemTitle", function(e) {
                $(this).parent().parent().attr("data_title", $(this).html());
                e.stopPropagation();
                e.preventDefault();
            });
			
            $(document).on("keydown, keyup", ".mainStruct .mainStructHeader .title", function(e) {
                $(".structTabs .tabItem.active .text").html($(this).html());
                $(this).parent().parent().attr("data_title", $(this).html());
                e.stopPropagation();
                e.preventDefault();
            });

            $(document).on("click", ".customDropDown .customDropDownTitle", function(e) {
                if ($(this).hasClass("active")) {
                    $(".customDropDown .customDropDownContent").hide();
                    $(".customDropDown .customDropDownTitle").removeClass("active");
                } else {
                    $(".customDropDown .customDropDownContent").hide();
                    $(".customDropDown .customDropDownTitle").removeClass("active");
                    $(this).parent().children(".customDropDownContent").toggle();
                    $(this).toggleClass("active");
                }
            });
			
            $(document).on("click", ".customDropDown .customDropDownContent .item", function(e) {
                var value = $(this).html();
                $(this).parent().parent().children(".customDropDownTitle").children(".text").html(value);
                $(this).parent().hide();
                $(this).parent().parent().children(".customDropDownTitle").removeClass("active");
                e.stopPropagation();
            });

            //convert structogramm
            if (window.location.href.indexOf("#fileContext=") !== -1) {
                var split1 = window.location.href.split("#fileContext=");
                var split2 = split1[1].split("fileType=");
                var fileContext = split2[0];
                var fileType = split2[1];
                openStructogramm(fileContext, fileType);
                history.pushState(null, '', 'struct.php');
                $(".createNewProjectDiv").hide();
            } else { //create new structogramm
                $(".createNewProjectDiv").show();
            }

           if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
                $(".browserBlock").show();
            } else {
                $(".browserBlock").hide();
            }

            var mouseOnContextMenuElement = null;
            $(document).on("mouseup", ".structContent", function(e) {
                mouseOnContextMenuElement = getUnderMouseElement(e.target);
            });

            //prevent contextMenu (rightClick)
            $(document).on("contextmenu", ".structContent", function(ev) {
                ev.preventDefault();
                //$(".customContextMenu").slideDown(100);
                var xPos = parseFloat(ev.clientX),
                    yPos = parseFloat(ev.clientY);
                if (parseFloat(window.innerWidth) - xPos > 272) {
                    $(".customContextMenu").css({
                        top: yPos + 'px',
                        left: (xPos - 20) + 'px'
                    });
                } else {
                    $(".customContextMenu").css({
                        top: yPos + 'px',
                        left: (xPos - 252) + 'px'
                    });
                }
				//$(".customContextMenu").show();
            });
			
			$(document).on("click", ".messageBoxMain>.singleMessage>.messageDelete", function() {
				$(this).parent().remove();
			});


            $(document).on("click", ".customContextMenu>.customContextMenuOption", function(e) {
                var elementMouseOver = document.elementFromPoint(e.clientX, e.clientY);
                if ($(this).hasClass("optionEditElement")) {
					$(mouseOnContextMenuElement).dblclick();
                } else if ($(this).hasClass("optionCutElement")) {
                    controls_cuttedElement = $(mouseOnContextMenuElement).detach();
                } else if ($(this).hasClass("optionRemoveElement")) {
                    $(mouseOnContextMenuElement).remove();
                }
                $(".customContextMenu").hide();
            });


            //prevent selection
            var selectionEnabled = true;
            $(document).on("mousedown mouseup", function(e) {
                if (e.target.classList.contains("title") && !$(e.target).parent().hasClass("itemSectionHeader")) {
                    selectionEnabled = true;
                } else if ($(".informationDiv").css("display") == "block") {
                    selectionEnabled = false;
                } else {
                    selectionEnabled = false;
                }

            });
			
            $(document).on("mousedown mouseup mousemove", function(e) {
                if (window.getSelection) {
                    if (selectionEnabled == true) {
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {
                    if (selectionEnabled == true) {
                        document.selection.empty();
                    }
                }
            });
			
            $(document).on("keydown keyup", ".createNewProjectDiv .contentDiv .textBox.createNewProject", function(e) {
                if (e.keyCode == 13) {
                    if ($(this).val() != "") {
                        window.localStorage.setItem("projectTitle", $(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                        $(".createNewProjectDiv").hide();
                        $(".structContent .mainStruct#mainStruct0 .mainStructHeader .title").html($(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                        $(".structContent .mainStruct#mainStruct0").attr("data_title", $(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                        $(".structTabs .tabItem.active .text").html($(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                    }
                }
                if ($(this).val() == "") {
                    $(this).parent().children(".logic.createNewProjectAccept").children(".accept").addClass("disabled");
                } else {
                    $(this).parent().children(".logic.createNewProjectAccept").children(".accept").removeClass("disabled");
                }
            });
			
            $(document).on("click", ".createNewProjectDiv .contentDiv .logic.createNewProjectAccept .accept", function(e) {
                if ($(this).parent().parent().children(".textBox").val() != "") {
                    setProjectTitle($(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                    $(".createNewProjectDiv").hide();
                    $(".structContent .mainStruct#mainStruct0 .mainStructHeader .title").html($(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                    $(".structContent .mainStruct#mainStruct0").attr("data_title", $(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                    $(".structTabs .tabItem.active .text").html($(".createNewProjectDiv .contentDiv .textBox.createNewProject").val());
                }
            });
			
			$(document).on("keydown keyup", ".createNewProjectDiv .contentDiv .textBox.openProjectCode", function(e) {
                if (e.keyCode == 13) {
                    if ($(this).val() != "") {
						setProjectTitle($(".createNewProjectDiv .contentDiv .textBox.openProjectCode").val());
                        $(".createNewProjectDiv").hide();
                        $(".structContent .mainStruct#mainStruct0 .mainStructHeader .title").html($(".createNewProjectDiv .contentDiv .textBox.openProjectCode").val());
                        $(".structContent .mainStruct#mainStruct0").attr("data_title", $(".createNewProjectDiv .contentDiv .textBox.openProjectCode").val());
                        $(".structTabs .tabItem.active .text").html($(".createNewProjectDiv .contentDiv .textBox.openProjectCode").val());
                    }
                }
                if ($(this).val() == "") {
                    $(this).parent().children(".logic.openProjectCodeAccpet").children(".accept").addClass("disabled");
                } else {
                    $(this).parent().children(".logic.openProjectCodeAccpet").children(".accept").removeClass("disabled");
                }
            });
			
            $(document).on("click", ".createNewProjectDiv .contentDiv .logic.openProjectCodeAccpet .accept", function(e) {
                if ($(".textBox.openProjectCode").val() != "") {
                    setProjectTitle($(".createNewProjectDiv .contentDiv .textBox.openProjectCode").val());
					openStructogramm($(".textBox.openProjectCode").val(), "sFile");
                    $(".createNewProjectDiv").hide();
                }
            });
			
			$(document).on("click", ".createNewProjectDiv .contentDiv .loadLastProject", function(e) {
                    setProjectTitle(getReOpenStructCode());
					openStructogramm(getReOpenStructCode(), "sFile");
                    $(".createNewProjectDiv").hide();
			});
			
            //got the permission to create the image
            $(document).on("click", ".selectStructsDiv .contentDiv .contentLogic .contentLogicAccept", function() {
                var items = document.querySelectorAll(".selectStructsDiv .contentDiv .container .structsTable tr:not(.tableHeader)");
                for (var i = 0; i < items.length; i++) {
                    if (items[i].getElementsByClassName("selectOption")[0].children.item(0).checked) {
                        $(".structContent .mainStruct#" + items[i].getAttribute("mainStructId")).css("display", "block");
                    }
                }
                $(".documentHeader").show();
                $(".documentHeader .documentHeaderProjectTitle").html(getProjetTitle());
                $(".documentHeader .documentHeaderDate").html(new Date().getDate() + "." + (new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth() + 1) + "." + new Date().getFullYear());
                $(".structContent").css({
                    width: parseInt($(".structContent").css("width")) * 0.8,
                    overflow: "hidden",
                    height: parseInt($(".structContent").css("height")) + 20 + 'px'
                });
                $(".structContent").show();
                $("body").css("background-color", "white");
                var node = document.getElementsByClassName('structContent')[0];
                $(".structContent").css("width", "1190px");
				window.setTimeout(function() {
				},50);
                var source = node;
				domtoimage.toPng(node).then(function(dataUrl) {
					var w = window.open("");
					w.document.write('<img src="' + dataUrl + '"/>');
					w.document.write("<style>@page {size: auto;  margin: 0mm; padding: 5mm; }</style>");
					setTimeout(function() {
						w.focus();
						w.print();
					}, 250);
					$(".structTabs .tabItem:not(.active)").each(function() {
						$(".structContent .mainStruct#mainStruct" + $(this).attr("id")).css("display", "none");
					});
					$(".selectStructsDiv").remove();
					$(".structContent").css({
						width: "calc(75% - 251px)",
						overflow: "auto",
						height: "auto"
					});
					$(".documentHeader").hide();
					$(".structContent").find("div").each(function() {
						$(this).css("background-color", "");
					});
					$(".structContent").css("width", "calc(75% - 251px)");
				});
            });
			
            $(document).on("click", ".selectStructsDiv .contentDiv .contentLogic .contentLogicAbort", function() {
                $(".selectStructsDiv").remove();
            });
			
			$(document).on("click", ".infoSite>.infoSiteMain>.infoSiteHeader>.close", function() {
				$(".infoSite").hide();
			});
			
			var mouseDown = false;
			$(document).on("mousedown", function() {
				mouseDown = true;
			});
			
			$(document).on("mouseup", function() {
				mouseDown = false;
			});
			
			$(document).on("dragover", function(e) {
				if(mouseDown) {
					$(".structContent")[0].scrollTop = e.pageY;
				}
			});
			
			$(document).on("click", ".customSettings .settingsContent .header .settingsClose", function() {
				$(".customSettings").hide();
			});
			
			$(document).on("click", ".navigation .itemSectionContent .item", function() {
				$(".createElemsInformation").show();
				$(".createElemsInformation>.createElemsInformationBox>.createElemsInformationBoxContent>.mainContentSDiv").hide();
				$(".createElemsInformation>.createElemsInformationBox>.createElemsInformationBoxContent>.mainContentSDiv.elem" + $(this).attr("elemid")).show();
			});
			
			$(document).on("click", ".createElemsInformation>.createElemsInformationBox>.createElemsInformationBoxHeader>.createElemsInformationBoxHeaderClose", function() {
				$(".createElemsInformation").hide();
			});
			
			$(document).on("click", ".shareStructClose", function() {
				$(".shareStruct").hide();
			});
			
			testIfNeedToLoad();
			
			//setStructCode("");
			var mouseDownOnSeperator = false,
                elemStructSeperatorParentWidth = 0,
                elemStructElement = null,
				mouseDownElemUnderC = null;
			$(document).on("mousedown", ".innerElementCellSeperator", function(e) {
				$(".elemStruct").attr("draggable", "false");
				mouseDownOnSeperator = true;
				elemStructElement = $(this).parent().parent();
				$(elemStructElement).removeAttr("draggable");
				mouseDownElemUnderC = $(this);
			});
			
			$(document).on("mousemove", function(e) {
				if(mouseDownOnSeperator && elemStructElement != null) {
					if($(elemStructElement).hasClass("elemStruct3")) {
						
						var parentElemWidth = parseFloat($(elemStructElement).css("width")),
							offset = parseFloat($(elemStructElement).offset().left);
						var p1 = parseFloat(e.pageX - offset) / parentElemWidth * 100;
						var p2 = 100 - p1;
						if (p1 > 4 && p1 < 96) {
							 elemStructElement.children(".innerElementTable").children(".innerElementCell").first().css("width","calc(" + p1 + "% - 1.5px)").attr("percentage", p1);
							 elemStructElement.children(".innerElementTable").children(".innerElementCell").last().css("width",  "calc(" + p2 + "% - 1.5px)").attr("percentage", p2);
							 
							 elemStructElement.children(".elemHeader").children(".line1").css("width","calc(" + p1 + "% - 1.5px)").attr("percentage", p1);
							 elemStructElement.children(".elemHeader").children(".line2").css("width",  "calc(" + p2 + "% - 1.5px)").attr("percentage", p2);
							 elemStructElement.children(".elemHeader").children(".line2").css("margin-left",  "calc(" + p1 + "% - 1.5px)");
						}
					} else if($(elemStructElement).hasClass("elemStruct4")) {
						var parentElemWidth = parseFloat($(elemStructElement).children(".innerElementTable").css("width")),
							offset = 0,
							parentNode = null,
							indexOfNode = $(mouseDownElemUnderC).index(),
							prevNode = $(mouseDownElemUnderC).prev(),
							nextNode = $(mouseDownElemUnderC).next();
							offset = parseFloat($(prevNode).offset().left);
						var xWidth = parseFloat($(prevNode).css("width")) + parseFloat($(nextNode).css("width")),
							xWidthP = parseFloat((parseFloat(100)/parentElemWidth) * xWidth);
						

						
						var p1 = parseFloat(parseFloat(e.pageX) - offset) / parentElemWidth * 100;
						var p2 = xWidthP - p1;
						
						
						
						if (p1 / xWidthP > 0.04 && p1 / xWidthP < 0.96) {
							//prevNode.css("width", "calc(" +getFracture(p1).toString() + ")").attr("percentage", getFracture(p1));
							prevNode.css("width", ((e.pageX - offset) / parentElemWidth * 100.00) + '%').attr("percentage", ((e.pageX - offset) / xWidth * 100.00));
							nextNode.css("width", "calc(" +getFracture(p2).toString() + ")").attr("percentage", getFracture(p2));
							if($(mouseDownElemUnderC).hasClass("defaultSeperatorCell") && $(elemStructElement).attr("defaultactive") == "true") {
								$(elemStructElement).children(".elemHeader").children(".line1").css({
									width: "calc(" + getFracture(((e.pageX-parseFloat($(elemStructElement).offset().left)) / parentElemWidth * 100)) + ")"
								}).attr("percentage", getFracture(((e.pageX-parseFloat($(elemStructElement).offset().left)) / parentElemWidth * 100)));
								$(elemStructElement).children(".elemHeader").children(".line2").css({
									marginLeft: "calc(" +getFracture(((e.pageX-parseFloat($(elemStructElement).offset().left)) / parentElemWidth * 100)) + ")",
									width: "calc(" +getFracture( (100 - ((e.pageX-parseFloat($(elemStructElement).offset().left)) / parentElemWidth * 100))) + ")"
								}).attr("percentage", getFracture( (100 - ((e.pageX-parseFloat($(elemStructElement).offset().left)) / parentElemWidth * 100))));
							}
							
							$(elemStructElement).children(".elemHeader").children(".headerSeperator:eq("+ (indexOfNode-1) +")").css({
								width: "calc(" +getFracture(p1) + ")"
							});
							$(elemStructElement).children(".elemHeader").children(".headerSeperator:eq("+ indexOfNode +")").css({
								width: "calc(" +getFracture(p2) + ")",
								marginLeft: "calc(" + getFracture((xWidthP - p2)).toString() + ")"
							});
						}
					}
				}
			});
			$(document).on("mouseup drop", function(e) {
				$(elemStructElement).attr("draggable", "true");
				$(".elemStruct").attr("draggable", "true");
				mouseDownOnSeperator = false;
				elemStructElement = null;
			});
			$(document).on("dragstart", function(e) {
				if(mouseDownOnSeperator) {
					return false;
				}
			});
        });
		
        document.addEventListener("DOMContentLoaded", function(e) {
            //seperator actions
            /*
            $(document).on("mousedown", ".innerElementCellSeperator", function(e) {
                mouseDownOnSeperator = true;
                elemStructSeperatorParentWidth = window.getComputedStyle(e.target.parentNode.parentNode, null).getPropertyValue("width");
                elemStructElement = this;
                e.stopPropagation();
                e.preventDefault();
            });
			
            //mousemove => switch and if (seperator)
            engine().customListenerClasses("mousemove", "", function(e) {
                if (mouseDownOnSeperator == true) {
                    if ($(e.target).parent().parent().hasClass("elemStruct3") || $(e.target).parent().hasClass("elemStruct3") || isElemType3(e.target)) {
                        var mainStructOffsetLeft = parseFloat($(elemStructElement).prev().offset().left);
                        // move seperator line
                        var parentElemWidth = parseFloat(window.getComputedStyle(elemStructElement.parentNode, null).getPropertyValue("width")); //100%
                        var widthPercentage1 = ((e.pageX - mainStructOffsetLeft) / parseFloat(window.getComputedStyle(elemStructElement.parentNode, null).getPropertyValue("width")) * 100);
                        var line1Elem = elemStructElement.parentNode.parentNode.childNodes[0].childNodes[0],
                            line2Elem = elemStructElement.parentNode.parentNode.childNodes[0].childNodes[2];
                        if (widthPercentage1 > 4 && widthPercentage1 < 96) {
                            line1Elem.style.width = widthPercentage1 + "%";
                            line2Elem.style.width = (100 - widthPercentage1) + "%";
                            line2Elem.style.marginLeft = widthPercentage1 + "%";
                            line1Elem.setAttribute("percentage", widthPercentage1);
                            line2Elem.setAttribute("percentage", (100 - widthPercentage1));
                            elemStructElement.parentNode.childNodes[0].style.width = widthPercentage1 + "%";
                            elemStructElement.parentNode.childNodes[2].style.width = "calc(100% - "+widthPercentage1 +"% - 3px)";
                        }
                        e.preventDefault();
                    } else if ($(e.target).parent().parent().hasClass("elemStruct4")) { //switch
                        var siblingsWidth = parseFloat($(elemStructElement).prev().css("width")) + parseFloat($(elemStructElement).next().css("width")),
                            completeWidth = parseFloat($(elemStructElement).parent().css("width")),
                            offsetLeft = parseFloat($(elemStructElement).prev().offset().left);
                        if (e.clientX - offsetLeft <= siblingsWidth - 20 && siblingsWidth - (e.clientX - offsetLeft) <= siblingsWidth - 20) {
                            $(elemStructElement).prev().css("width", ((e.clientX - offsetLeft) / completeWidth * 100.00) + '%').attr("percentage",((e.pageX - offsetLeft) / completeWidth * 100.00));
                            var percentage = (parseFloat(100) / completeWidth) * siblingsWidth;
                            var fracture = getFracture(percentage - ((e.pageX - offsetLeft) / completeWidth * 100.00));
                            $(elemStructElement).next().css("width", "calc("+ fracture.toString() +")").attr("data-percentage", percentage - ((e.pageX - offsetLeft) / completeWidth * 100.00));
                            var indexElement = $(elemStructElement).index(".innerElementCellSeperator");
                            $(elemStructElement).parent().parent().children(".elemHeader").children(".headerSeperator:nth-child(" + (indexElement + 1) + ")").css({
                                left: (($(elemStructElement).prev().offset().left - parseFloat($(".structContent .mainStruct .dropZone").offset().left)) / completeWidth * 100) + '%',
                                width: (((e.pageX - offsetLeft) / completeWidth * 100) + '%')
                            });
                            if ($(elemStructElement).hasClass("defaultSeperatorCell") && $(elemStructElement).parent().parent().attr("defaultactive") == "true") {
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".line1").css({
                                    width: ((parseFloat(e.pageX) - parseFloat($(elemStructElement).parent().parent().children(".elemHeader").offset().left)) / completeWidth * 100.00) + '%',
                                    left: 0,
                                    border: "none"
                                }).attr("percentage", ((parseFloat(e.pageX) - parseFloat($(elemStructElement).parent().parent().children(".elemHeader").offset().left)) / completeWidth * 100.00));
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".elemTitle").removeClass("defaultHidden");
                                $(elemStructElement).parent().parent().children(".innerElementTable").children(".defaultSeperatorCell").show();
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".line2").show();
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".line2").css({
                                    width: (100 - ((parseFloat(e.pageX) - parseFloat($(elemStructElement).parent().parent().children(".elemHeader").offset().left)) / completeWidth * 100.00)) + "%",
                                    left: ((parseFloat(e.pageX) - parseFloat($(elemStructElement).parent().parent().children(".elemHeader").offset().left)) / completeWidth * 100.00) + '%',
                                    border: "none"
                                }).attr("percentage", (100 - ((parseFloat(e.pageX) - parseFloat($(elemStructElement).parent().parent().children(".elemHeader").offset().left)) / completeWidth * 100.00)));
                            } else if ($(elemStructElement).parent().parent().attr("defaultactive") != "true") {
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".line1").css("width", "100%");
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".line2").hide();
                                $(elemStructElement).parent().parent().children(".elemHeader").children(".elemTitle").addClass("defaultHidden");

                                $(elemStructElement).parent().parent().children(".innerElementTable").children(".defaultSeperatorCell").hide();
                                $(elemStructElement).parent().parent().children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell").css({
                                    width: parseFloat($(elemStructElement).parent().parent().children(".innerElementTable").css("width")) / $(elemStructElement).parent().parent().children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell").length
                                }).attr("percentage", parseFloat($(elemStructElement).parent().parent().children(".innerElementTable").css("width")) / $(elemStructElement).parent().parent().children(".innerElementTable").children(".innerElementCell:not(.defaultSeperatorCell").length);
                            }
                        }
                    }
                }
            });
			
            engine().customListenerClasses("mouseup", "", function(e) {
                mouseDownOnSeperator = false;
            });
			*/
        });
		
		//create empty new structogramm
        function createNewDiagram(id) {
            var mainStruct = $("<div class='mainStruct' id='mainStruct" + id + "'></div>"),
                mainStructHeader = $("<div class='mainStructHeader'><div class='title'>Titel</div></div>"),
                dropZone = $("<div class='dropZone innerDroppable'></div>"),
                mainStructBottom = $("<div class='mainStructBottom'></div>");
            $(mainStruct).append(mainStructHeader).append(dropZone).append(mainStructBottom);
            $(".structContent .mainStruct").hide();
            $(".structContent").append(mainStruct);
        }
		
		//download Project
        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
		
		//gets the element under the mouse (used in the context menu)
        function getUnderMouseElement(target) {
            return $(target).closest(".elemStruct");
        }
		
		//sets the project Title
        function setProjectTitle(title) {
            if (typeof(Storage) !== "undefined") {
                window.localStorage.setItem("projectTitle", title);
            } else if(navigator.cookieEnabled) {
                var d = new Date();
                d.setTime(d.getTime() + (365*24*60*60*1000));
                var expires = "expires="+ d.toUTCString();
                document.cookie = "projectTitle" + "=" + title + ";" + expires + ";path=/";
            }
			var formData = new FormData();
			var content = "";
			var mainStructs = document.querySelectorAll(".mainStruct");
			for (var i = 0; i < mainStructs.length; i++) {
				content += "mainStructHeaderCompleteLoad:{";
				content += mainStructs[i].outerHTML;
				content += "}";
			}
			formData.append("structContent", content);
			formData.append("projectTitle", title);
			$.ajax({
				url: "shareStruct/shareStruct.php",
				type: 'post',
				data: formData,
				dataType: 'html',
				async: true,
				processData: false,
				contentType: false,
				success: function(data) {
					setStructCode(data);
				}
			});
        }
		
		//get the Project title
        function getProjetTitle() {
            if (typeof(Storage) !== "undefined") {
                return window.localStorage.getItem("projectTitle");
            } else if(navigator.cookieEnabled) {
                getCookie("projectTitle");
            }
        }
		
		//get cookie method
        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
		
		//returns the fracture of the percentage
        function getFracture(percentage) {
            var fracture1 =  1/(percentage/100),
                fracture2 = fracture1,
                times = 0;
            while(fracture1%10 > 0) {
                fracture1 *= 10;
                times++;
            }
            fracture1 /= 10;
            times--;
            var fractureUnder = fracture1 * Math.pow(times, 10);
            return "1/" + fracture1.toString() + " * " + Math.pow(10,times).toString() + " * 100%";
        }
		
		//save Project
		function saveProject() {
			var structCode;
			if (typeof(Storage) !== "undefined") {
                structCode = window.localStorage.getItem("structCode");
            } else if(navigator.cookieEnabled) {
                structCode = getCookie("structCode");
            }
			var formData = new FormData();
			var content = "";
			var mainStructs = document.querySelectorAll(".mainStruct");
			for (var i = 0; i < mainStructs.length; i++) {
				content += "mainStructHeaderCompleteLoad:{";
				content += mainStructs[i].outerHTML;
				content += "}";
			}
			formData.append("structContent", content);
			formData.append("structCode", structCode);
			$.ajax({
				url: "shareStruct/saveStruct.php",
				type: 'post',
				data: formData,
				dataType: 'html',
				async: true,
				processData: false,
				contentType: false,
				success: function(data) {
					$(".menuBar").removeClass("notSaved");
				}
			});
			addNewMessage("Projekt gespeichert");
		}
		
		//sets the project code
		function setStructCode(structCode) {
			if (typeof(Storage) !== "undefined") {
                window.localStorage.setItem("structCode", structCode);
            } else if(navigator.cookieEnabled) {
                var d = new Date();
                d.setTime(d.getTime() + (365*24*60*60*1000));
                var expires = "expires="+ d.toUTCString();
                document.cookie = "structCode" + "=" + structCode + ";" + expires + ";path=/";
            }
		}
		
		//add message to the control center
		function addNewMessage(title) {
			var singleMessage = $("<div class='singleMessage'></div>"),
				messageTitle = $("<div class='messageTitle'></div>"),
				messageDelete = $("<div class='messageDelete'>&times;</div>");
			$(messageTitle).html(title);
			var currentdate = new Date(); 
			$(singleMessage).attr("id", "singleMessage" + $(".singleMessage").length).attr("sTime", Date.now());
			$(singleMessage).append(messageTitle).append(messageDelete);
			$(".messageBoxMain").append(singleMessage);
		}
		
		//set project code for next usage
		function setToOpenProject() {
			var code = getProjectCode();
			if (typeof(Storage) !== "undefined") {
                window.localStorage.setItem("structCodeReOpen", code);
            } else if(navigator.cookieEnabled) {
                var d = new Date();
                d.setTime(d.getTime() + (365*24*60*60*1000));
                var expires = "expires="+ d.toUTCString();
                document.cookie = "structCodeReOpen" + "=" + code + ";" + expires + ";path=/";
            }
		}
		
		//gets the last project code
		function getReOpenStructCode() {
			if (typeof(Storage) !== "undefined") {
                return window.localStorage.getItem("structCodeReOpen");
            } else if(navigator.cookieEnabled) {
                return getCookie("structCodeReOpen");
            }
		}
		
		//gets the actual project code
		function getProjectCode() {
			if (typeof(Storage) !== "undefined") {
                return window.localStorage.getItem("structCode");
            } else if(navigator.cookieEnabled) {
                return getCookie("structCode");
            }
		}
		
		//returns if elem is if
		function isElemType3(el) {
			var nel = el;
			while(!$(nel).hasClass("elemStruct")) {
				nel = $(nel).parent();	
			}
			nel = $(nel).parent();
			if($(nel).hasClass("innerElementCell")) {
				return true;
			} else {
				return false;
			}
		}
		
		//export image as png / jpg
		function exportAs(type) {
			domtoimage.toPng($(".structContent")[0])
            .then(function(dataUrl) {
				if(type == 0) {
					downloadURI(dataUrl, getProjetTitle() + ".png");
				} else if( type == 1) {
					downloadURI(dataUrl, getProjetTitle() + ".jpg");
				}
            });
		}
		
		//download image
		function downloadURI(uri, name) {
			var link = document.createElement("a");
			link.download = name;
			link.href = uri;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			delete link;
		}
		
		//load struct if structcode is in the url
		function testIfNeedToLoad() {
			if("<?php echo $_GET["structCode"]; ?>" != "") {
				openStructogramm("<?php echo $_GET["structCode"]; ?>", "sFile");
				setProjectTitle("<?php echo $_GET["structCode"]; ?>");
                $(".createNewProjectDiv").hide();
			}
		}
    </script>
	<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-J8R18F1LH0"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-J8R18F1LH0');
</script>
</head>

<body id="body">
	<!-- menu bar -->
    <div class="menuBar">
        <div class="dropDownDiv">
            <div class="titleButton l_id_file" id="menuBarItem1">Datei</div>
            <div class="dropDownContent" id="menuBarDropDownContent1">
                <div class="dropDownOption l_id_openProject" id="item2">
                    <div class="text">Projekt/Datei &ouml;ffnen</div>
                </div>
                <div class="dropDownSeperator"></div>
				<div class="dropDownOption l_id_downloadProject" id="itemExport">
                    <div class="text">Exportieren</div>
                    <div class="expandTriangeLeft">&#9656;</div>
					<div class="expandTriangleOptions">
						<div class="dropDownOption l_id_openProject" id="itemExportPNG">
                    		<div class="text">als PNG</div>
                		</div>
                		<div class="dropDownOption" id="itemExportJPG">
                    		<div class="text">als JPG</div>
                		</div>
					</div>
                </div>
                <div class="dropDownOption l_id_downloadProject" id="item3">
                    <div class="text">Download</div>
                    <div class="shortCut">Ctrl + S</div>
                </div>
                <div class="dropDownOption l_id_createImage" id="item4">
                    <div class="text">Bild erstellen</div>
                </div>
				<div class="dropDownOption l_id_createImage" id="shareProject">
                    <div class="text">Projekt ver&ouml;ffentlichen</div>
                </div>
                <div class="dropDownSeperator l_id_settings" id="item5"></div>
                <div class="dropDownOption" id="item6">
                    <div class="text">Einstellungen</div>
                    <div class="shortCut">Ctrl + Comma</div>
                </div>
            </div>
        </div>
        <div class="dropDownDiv">
            <div class="titleButton" id="menuBarItem2">Bearbeiten</div>
            <div class="dropDownContent" id="menuBarDropDownContent2">
                <div class="dropDownOption l_id_historyGoBack" id="goBack">
                    <div class="text">R&uuml;ckg&auml;ngig</div>
                    <div class="shortCut">Ctrl + Z</div>
                </div>
                <div class="dropDownOption l_id_historyGoForward" id="goForward">
                    <div class="text">Wiederholen</div>
                    <div class="shortCut">Ctrl + Y</div>
                </div>
                <div class="dropDownOption l_id_toggleFastEditMode" id="onOffFastEditMode">
                    <div class="text">Fastedit Mode aktivieren</div>
                    <div class="shortCut">Ctrl + I</div>
                </div>
            </div>
        </div>
        <div class="dropDownDiv">
            <div class="titleButton" id="menuBarItem3">Hilfe</div>
            <div class="dropDownContent" id="menuBarDropDownContent3">
                <div class="dropDownOption" id="openInfoSite">Info</div>
            </div>
        </div>
    </div>
	
	<!-- normalView -->
	<div class="normalView">
    <div class="structTabs">
        <div class="tabItem active" id="0">
            <div class="text">Hauptstruktogram</div>
            <div class="close" style="display: none;">x</div>
        </div>
        <div class="openNewTab">
            <div class="text">+</div>
        </div>
    </div>

	 <!-- left side navigation -->
    <div class="navigation">
		<div class="navigationItemContent">
        <div class="itemSection">
            <div class="itemSectionHeader">
                <div class="title">Schleifen</div>
            </div>
            <div class="itemSectionContent">
                <div class="item createElem" id="elem0" draggable="true" elemId="0" ondragstart="javascript:void(0)">
                    <div class="text">While-Schleife</div>
                </div>
                <div class="item createElem" id="elem1" draggable="true" elemId="1">
                    <div class="text">DoWhile-Schleife</div>
                </div>
                <div class="item createElem" id="elem2" draggable="true" elemId="2">
                    <div class="text">For-Schleife</div>
                </div>
            </div>
        </div>
        <div class="itemSection">
            <div class="itemSectionHeader">
                <div class="title">Entscheidungen</div>
            </div>
            <div class="itemSectionContent">
                <div class="item createElem" id="elem3" draggable="true" elemId="3">
                    <div class="text">If-Abfrage</div>
                </div>
                <div class="item createElem" id="elem4" draggable="true" elemId="4">
                    <div class="text">Mehrfachauswahl</div>
                </div>
            </div>
        </div>
        <div class="itemSection">
            <div class="itemSectionHeader">
                <div class="title">Weitere Elemente</div>
            </div>
            <div class="itemSectionContent">
                <div class="item createElem" id="elem5" draggable="true" elemId="5">
                    <div class="text">Anweisung</div>
                </div>

                <div class="item createElem" id="elem7" draggable="true" elemId="7">
                    <div class="text">Funktion</div>
                </div>
            </div>
        </div>
		</div>
        <div class="itemSection itemSectionBottom" style="border-top: 1px solid black;">
            <div class="deleteSection">
                <div class="text">Element l&ouml;schen</div>
            </div>
        </div>
        <div class="navigationToggle">
            <div class="text">Menu verkleinern</div>
            <div class="symbole">&#9664;</div>
        </div>
    </div>
		
	<!-- struct Content -->
    <div class="structContent">
        <div class="documentHeader">
            <div class="documentHeaderProjectTitle">title</div>
            <div class="documentHeaderDate">24.1.2017</div>
        </div>
        <div class="mainStruct" id="mainStruct0" params="[]">
            <div class="mainStructHeader">
                <div class="title">title</div>
            </div>
            <div class="dropZone innerDroppable"></div>
            <div class="mainStructBottom"></div>
        </div>
    </div>
	</div>
	
    <!-- menu Bar Divs and Items to open -->
    <input type="file" class="openFileDialog" id="openFileDialog" style="display: none;" accept=".structIo,.7, .nsd" />
    <div class="settingsDiv">
    </div>
    <div class="informationDiv">
        <div class="informationDivBox">
            <div class="informationHeader">
                <div class="title">Element bearbeiten</div>
            </div>
            <div class="informationContent">
                <div class="singleDiv">
                    <div class="label">Titel:</div>
                    <input type="text" placeholder="Titel" class="elementTitle"/>
                </div>
                <div class="singleDiv">
                    <div class="label">Kommentar:</div>
                    <textarea type="text" class="elementDescription"></textarea>
                </div>
                <div class="singleDiv switchDefaultActive">
                    <div class="customToggleSwitch">
                        <div class="label">Default aktiv:</div>
                        <input type="checkbox" name="settingsSwitchCaseDefaultActive" />
                        <div class="overlay">
                            <div class="check"></div>
                        </div>
                    </div>
                </div>
                <div class="singleDiv switchCases">
                    <div class="customList">
                        <div class="customListItems">
                            <div class="customListItem customListItemAddNew">
                                <input type="text" placeholder="Beschreibung" class="description" />
                                <div class="addItem">&#10004;</div>
                            </div>
                        </div>
                    </div>
                </div>
				<div class="singleDiv mainStructParams">
					<div class="label">&Uuml;bergabeparameter:</div>
                    <div class="customListAdvanced">
                        <div class="customListItems">
                            <div class="customListItem customListItemAddNew">
								<select class="dataType">
								</select>
                                <input type="text" placeholder="Beschreibung" class="varName" />
                                <div class="addItem">&#10004;</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="informationElementContent">
                    <div class="singleDivTitle">
                        <div class="text">Simulationseinstellungen:</div>
                    </div>
                    <div class="simulationDivContent">
                        <div class="simulationSingleDiv"></div>
                    </div>
                </div>
            </div>
            <div class="informationLogic">
                <div class="abortButton customButton">
                    <div clas="text">Abbrechen</div>
                </div>
                <div class="acceptButton customButton">
                        <div clas="text">OK</div>
                    </div>
            </div>
        </div>
    </div>
	
    <!-- new Project Div -->
    <div class="createNewProjectDiv">
        <div class="contentDiv">
            <div class="description">Neues Projekt erstellen:</div>
            <input type="text" class="textBox createNewProject" placeholder="Projekttitel" />
            <div class="logic createNewProjectAccept">
                <div class="accept disabled">Projekt erstellen</div>
            </div>
			<div class="description">Projekt mit Code &ouml;ffnen:</div>
            <input type="text" class="textBox openProjectCode" placeholder="Projektcode" />
            <div class="logic openProjectCodeAccpet">
                <div class="accept disabled">Projekt &ouml;ffnen</div>
            </div>
			<div class="loadLastProject">
				<div class="text">Zuletzt bearbeitetes Projekt laden</div>
			</div>
			
        </div>
    </div>
	
    <!-- old Browser Information -->
    <div class="browserBlock">
        <div class="description">Es tut uns leid, dein aktueller Browser wird von dieser Plattform nicht unterstützt.</div>
        <div class="tryOut">
            <div class="title">Um die Plattform nutzen zu k&ouml;nnen bitten wir dich einen der folgenden Browser zu nutzen:</div>
            <ul>
                <li>Google Chrome</li>
                <li>Mozilla Firefox</li>
                <li>Opera</li>
                <li>Microsoft Edge</li>
            </ul>
        </div>
    </div>
	
    <!-- custom Settinsg -->
    <div class="customSettings">
        <div class="settingsContent">
            <div class="header">
                <div class="title">Einstellungen</div>
				<div class="settingsClose">&times;</div>
            </div>
            <div class="mainContent">
                <div class="loadingContent">
					<div class="loadingContentPart">
						<div class="loadingContentPartTitle">Sprache ausw&auml;hlen:</div>
						<div class="loadingContentPartContent">
							<div id="google_translate_element"></div>
						</div>
					</div>
                </div>
            </div>
        </div>
    </div>
	
	<!-- custom right click menu -->
    <div class="customContextMenu">
        <div class='customContextMenuOption optionEditElement'>
            <div class='text'>Element bearbeiten</div>
        </div>
        <div class='customContextMenuOption optionCutElement'>
            <div class='text'>Element ausschneiden</div>
        </div>
        <div class='customContextMenuOption optionRemoveElement'>
            <div class='text'>Element entfernen</div>
        </div>
    </div>
	
	<!-- convert code to struct -->
    <div class="convertCodeToStruct">
        <div class="mainContent">
            <div class="mainHeader">
                <div class="mainHeaderTitle">Code in Struktogramm umwandeln</div>
            </div>
            <div class="mainContainer" contenteditable="false">
                <pre class="codeContainer" contenteditable="false">
                    <span class="singleLine"><span contenteditable="true"> &nbsp;</span></span>
					</pre>
                </div>
            
            <div class="mainLogic">
                    <div class="LogicAccept">Struktogramm(e) erstellen</div>
                <div class="LogicAbort">Abbrechen</div>
                
            </div>
        </div>
	</div>
	
	<!-- info site -->
	<div class="infoSite">
		<div class="infoSiteMain">
			<div class="infoSiteHeader">
				<div class="text">Info</div>
				<div class="close">&times;</div>
			</div>
			<div class="infoSiteContent">
				<div class="infoSiteContentSingleDiv">
					<div class="titleInfoSite">Name:</div>
					<div class="contentInfoSite">Structorizer</div>
				</div>
				<div class="infoSiteContentSingleDiv">
					<div class="titleInfoSite">Beschreibung:</div>
					<div class="contentInfoSite">Mit einem Struktogrammeditor k&ouml;nnen Programmabl&auml;ufe vereinfacht dargestellt werden.<br>
					Dadurch kann mit Hilfe von einem Struktogramm ein funktionierendes Programm auf einer anderer beliebigen Sprache erstellt werden.</div>
				</div>
				<div class="infoSiteContentSingleDiv">
					<div class="titleInfoSite">Version:</div>
					<div class="contentInfoSite">pre1.0.2</div>
				</div>
				<div class="infoSiteContentSingleDiv">
					<div class="titleInfoSite">Urheberrecht:</div>
					<div class="contentInfoSite">structorizer.com &#9400; Copyright - 2017 Janis Huser - Alle Rechte vorbehalten</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="messageBoxMain"></div>
	
	<div class="firstVisit">
		<?php
		include "firstVisit.php";
		?>
	</div>
	
	<div class="shareStruct">
		<div class="shareStructContainer">
		<div class="shareStructHeader">
			<div class="headerTitle">Struktogramm teilen</div>
			<div class="shareStructClose">&times;</div>
		</div>
		<div class="shareStructContent">
			<div class="description">Das Projekt kann mit folgendem Code: <strong class="shareStructCodeToSend">code</strong> <br>
				oder unter 
				<a class="shareStructCodeWebsiteHref" target="_blank" href="https://www.structorizer.com/?structCode=a"><strong class="shareStructCodeWebSite">website</strong></a> angesehen werden.
			</div>
		</div>
		</div>
	</div>
	
	<div class="createElemsInformation">
		<div class="createElemsInformationBox">
			<div class="createElemsInformationBoxHeader">
				<div class="createElemsInformationBoxHeaderTitle">Information</div>
				<div class="createElemsInformationBoxHeaderClose">&times;</div>
			</div>
			<div class="createElemsInformationBoxContent">
				<div class="mainContentSDiv elem0">
					<div class="mainTitle">While-Schlaufe:</div>
					<div class="mainDescription">
						Eine While-Schlaufe wird so lange ausgeführt, bis die Bedingung nicht mehr zutrifft.
					</div>
					<div class="smallTitle">Code Beispiel:</div>
					<div class="codeExample">
						<span class="singleLine"><font color="#BDCDDD">while</font><font color="#FFFFFF">( <font color="#DFCEC5">a</font> >= 1 ) </font><font color="#DEBDD7">&#123;</font></span>
						<span class="singleLine"></span>
						<span class="singleLine"><font color="#DEBDD7">}</font></span>
					</div>
				</div>
				<div class="mainContentSDiv elem1">
					<div class="mainTitle">DoWhile-Schlaufe:</div>
					<div class="mainDescription">
						Mit einer Do-While Schlaufe wird zuerst der Schlaufenblock ausgeführt und dann die Bedingung geprüft.
					</div>
					<div class="smallTitle">Code Beispiel:</div>
					<div class="codeExample">
						<span class="singleLine"><font color="#BDCDDD">do</font><font color="#DEBDD7">&#123;</font></span>
						<span class="singleLine"></span>
						<span class="singleLine"><font color="#DEBDD7">}</font><font color="#FFFFFF">( <font color="#DFCEC5">a</font> >= 1 ); </font></span>
					</div>
				</div>
				<div class="mainContentSDiv elem2">
					<div class="mainTitle">For-Schlaufe:</div>
					<div class="mainDescription">
						Eine For-Schlaufe kann einen Block eine bestimmte Anzahl mal wiederholen.
					</div>
					<div class="smallTitle">Code Beispiel:</div>
					<div class="codeExample">
						<span class="singleLine"><font color="#BDCDDD">for</font><font color="#FFFFFF">(int <font color="#DFCEC5">i</font>=0; <font color="#DFCEC5">i</font>>=5; <font color="#DFCEC5">i</font>++) &#123;</font></span>
						<span class="singleLine"></span>
						<span class="singleLine"><font color="#DEBDD7">}</font></span>
						
					</div>
				</div>
				<div class="mainContentSDiv elem3">
					<div class="mainTitle">If-Abfrage:</div>
					<div class="mainDescription">
						Mit einer If-Abfrage kann entschieden werden ob ein Zustand wahr oder nicht wahr ist.
					</div>
				</div>
				<div class="mainContentSDiv elem4">
					<div class="mainTitle">Switch:</div>
					<div class="mainDescription">
						Ein Switch kann eine Menge an if / else Blöcken hintereinander ersetzen.
					</div>
				</div>
				<div class="mainContentSDiv elem5">
					<div class="mainTitle">Anweisung:</div>
					<div class="mainDescription">
						Mit einer Anweisung wird der Wert auf der linken Seite mit dem von der rechten ersetzt.
					</div>
				</div>
				<div class="mainContentSDiv elem7">
					<div class="mainTitle">Funktion:</div>
					<div class="mainDescription">
						Mit einer Funktion kann ein Block der an unterschiedlichen Orten wiederholt wird, ersetzt werden.
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="circleLoadingBar">
		<div class="loadingBar">
			
		</div>
	</div>
</body>

</html>