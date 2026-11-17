var overView = function(context) {
    if (this.__proto__.constructor !== overView) {
        return new overView(context);
    }
    this.context = context;
    this.createOverview = function() {
        var overViewMain = $("<div class='mainOverview'></div>");
        var overViewMainTitle = $("<div class='mainOverviewheader'><div class='title'>Übersicht aller Diagramme</div><div class='selected'>Kein Struktogram ausgewählt</div></div>")
        var overViewMainContent = $("<div class='mainOverviewContent'></div>");
        var mainStructs = document.querySelectorAll(".mainStruct");
        for (var i = 0; i < mainStructs.length; i++) {
            mainStructs[i].style.display = "block";
            var singleStruct = $("<div class='singleStruct'></div>"),
                header = $("<div class='header'></div>");
0
            $(header).html($(mainStructs[i]).children(".mainStructHeader").children(".title").html());

            $(singleStruct).append($(header));
            $(singleStruct).append($(".mainStruct:nth-child(" + (i + 1) + ")").html());

            $(overViewMainContent).append(singleStruct);
        }


        $(overViewMain).append(overViewMainTitle).append(overViewMainContent);

        //$(".navigation").animate({ "margin-left": '-=250' }, 250); //hide Navigation Menu
        window.setTimeout(function() {
            $(".structContent").hide(); //hide edit mode from diagram
            $(".structTabs").hide();
            if ($(".mainOverview").length == 0) {
                $("body").append(overViewMain);
            } else {
                $(".mainOverview").remove();
                $("body").append(overViewMain);
            }
        }, 250);
        $(".mainOverview .mainOverviewContent .singleStruct .mainStruct").show();
    }
}