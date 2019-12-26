
document.addEventListener("DOMContentLoaded", function() {    
    document.body.innerHTML += 
    "<div class='documentationMainDiv'>"
        +"<div class='navigationMenu'>"
            +"<div class='navigationMenuTitle'>Navigation</div>"
            +"<div class='navigationMenuContent'>"
                +"<div class='navigationItem'>"
                    +"<div class='expand'>+</div>"
                    +"<div class='title'>Bedienung</div>"
                +"</div>"
            
            +"</div>"
        +"</div>"
        +"<div class='innerDiv'>"
            +"<div class='header'>"
                +"<div class='title'>Dokumentation & Hilfe</div>"
                +"<div class='close'>&#10799;</div>"
            +"</div>"
            +"<div class='content'>content</div>"
        +"</div>"
        
    +"</div>"; 
});
document.onclick = (function(e) {
    if( e.target.classList.contains("expand") || e.target.classList.contains("title")) {
        if( (e.target).parentElement.classList.contains("navigationItem")) {
            
        }
    }
    if( e.target.classList.contains("close") ) {
        document.querySelectorAll(".documentationMainDiv")[0].style.display = "none";
    }
    //e.stopPropagation();
});