document.addEventListener("DOMContentLoaded", function() {

    var paintTool = $(".paintBrush");

    var paintToolActive = false,
        paintToolActiveColor = 0;


    var mouseDown = false;

    var elemDragActive = false,
        draggingElement = null,
        draggingElementOffsetTop = 0,
        draggingElementOffsetLeft = 0,
        draggingElementOldParent = null;

    document.onclick = function(ev) {
        if (paintToolActive) {
            $(ev.target).closest(".elemStruct").css("background-color", paintToolActiveColor);
        }
    };

    $(document).on("mousedown", ".elemStruct", function (e) {
        /*
        if (elemDragActive == false && draggingElement == null) {
            elemDragActive = true;
            draggingElement = this;

            $(this).css({
                position: "absolute",
                zIndex: 100
            });
            draggingElementOldParent = $(this).parent();
            draggingElementOffsetLeft = parseFloat($(this).parent().offset().left);
            draggingElementOffsetTop = parseFloat($(this).parent().offset().top);
        }
       */
    });


    document.onmousedown = function(ev) {
        if (paintToolActive) {
            //$(ev.target).closest(".elemStruct").css("background-color", paintToolActiveColor);
        }
        mouseDown = true;
    };

    document.onmousemove = function(ev) {
        if (elemDragActive && mouseDown) {
            if ((parseFloat(ev.clientY - draggingElementOffsetTop) < parseFloat($(draggingElement).closest(".mainStruct").css("height"))) && (parseFloat(ev.clientX-draggingElementOffsetLeft) < parseFloat($(draggingElement).closest(".mainStruct").css("width")))) {
                $(draggingElement).css({
                    position: "absolute",
                    top: ev.clientY - draggingElementOffsetTop + "px",
                    left: ev.clientX - draggingElementOffsetLeft + "px"
                });
            }
        }
    };

    document.onmouseup = function(ev) {
        /*
        if (elemDragActive) {
            snaptoGrid(draggingElement, draggingElementOffsetLeft, draggingElementOffsetTop, elemDragActive, ev);
            if ($(ev.target).hasClass("insertBefore")) {
                $(ev.target).append(elemDragActive);
            }
            //elemDragActive = false;
            draggingElement = null;
        }
        
        mouseDown = false;
        */
    };

    $(document).on("click", ".navigation .itemSection.itemSectionBottom .itemSectionContent .selectColor .color", function(e) {
        paintToolActiveColor = $(this).css("background-color");
        paintToolActive = true;

        switch ($(this).index()) {
            case 0:
                $(".structContent").css("cursor", "url(images/lightsalmon.svg), auto");
                break;
            case 1:
                $(".structContent").css("cursor", "url(images/lightgreen.svg), auto");
                break;
            case 2:
                $(".structContent").css("cursor", "url(images/lightblue.svg), auto");
                break;
            case 3:
                $(".structContent").css("cursor", "url(images/lightcoral.svg), auto");
                break;
            case 4:
                $(".structContent").css("cursor", "url(images/lightseagreen.svg), auto");
                break;
            case 5:
                $(".structContent").css("cursor", "url(images/white.svg), auto");
                break;
        }


    });

    document.body.onkeydown = function(e) {
        if (e.keyCode == 27) {
            paintToolActive = false;
            e.preventDefault();
            $(".structContent").css("cursor", "auto");
            return false;
        }

    };

    $(document).on("click", ".structContent .mainStruct .dropZone .elemStruct", function(e) {});

});

function snaptoGrid(draggingElement, draggingElementOffsetLeft, draggingElementOffsetTop, elemDragActive, event) {
    /*if (elemDragActive) {

        var mainStruct = $(draggingElement).closest(".mainStruct"),
            xPos = parseFloat($(draggingElement).css("left")),
            yPos = parseFloat($(draggingElement).css("top"));
        var bestPossible = null;
        $(mainStruct).find(".innerDroppable").each(function() {
            if (this.getBoundingClientRect().top <= yPos && this.getBoundingClientRect().bottom >= yPos && this.getBoundingClientRect().left >= xPos && this.getBoundingClientRect().right <= xPos) {
                bestPossible = $(this);
            }
        });
        $(draggingElement).appendTo(bestPossible);
        $(draggingElement).css({
            position: "relative",
            top: "0px",
            left: "0px"
        });
        draggingElement = null;
        elemDragActive = false;
    }
    */
}