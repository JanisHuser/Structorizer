<!DOCTYPE HTML>
<html>

<head>
    <title>Structorizer</title>
    <link rel="icon" href="favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1 user-scalable=0">
	<meta charset="UTF-8">
	<meta name="description" content="Kostenlos Struktogramme online erstellen, bearbeiten und teilen.">
	<meta name="keywords" content="Struktogramme, Structogram, Structogramm, Struktogramm, Struktogrammeditor, Structorizer, Online, Web, Free, share, teilen, edit, bearbeiten, edit, öffnen, open, Code, Coding, Tutorial, easy, learning, mobile, portable, erstellen, create, mobil, handy, smartphone, anschauen, ansehen, view">
	<meta name="author" content="Janis Huser">
    <script src="script/convertStructogram.js" type="text/javascript"></script>
	
	<link href="https://fonts.googleapis.com/css?family=Bree+Serif" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Anton" rel="stylesheet">
	<link href="styles/generall.css" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Quicksand" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <style>
        @media screen and (max-width: 736px) {
            body {
				/*font-family: 'Bree Serif', serif;*/
				font-family: 'Quicksand', sans-serif;
                margin: 0 auto;
            }
            .header {
                color: white;
                background-color: #3B5998;
                position: fixed;
                font-size: 0;
				width: 100%;
            }
            .header .logo {
                font-size: 24px;
                display: inline-block;
                cursor: pointer;
                padding: 0.5em;
                transition: all 0.25s ease-out;
                vertical-align: top;
            }

            .header .logo:hover {
                color: #3B5998;
                background-color: white;
                box-shadow: 0px 2px 2px #b2b2b2;
                cursor: pointer;
            }

            .header .logo .text {
                vertical-align: middle;
                text-align: center;
            }

            .header>.title {
                font-size: 24px;
                text-align: center;
                padding: 0.5em;
                width: calc(100% - 47px - 4em);
                display: inline-block;
                vertical-align: top;
            }
            .header .menu {
                display: inline-block;
                font-size: 24px;
                vertical-align: top;
                height: 52px;
                width: 3em;
                float: right;
                position: relative;
                cursor: pointer;
                display: none;
            }
            .header .menu .bars {
                width: 2em;
                height: 5px;
                background-color: white;
                content: ' ';
                position: absolute;
                right: 13px;
                top: 23px;
                border-radius: 4px;
                text-align: right;
                transition: all .1s ease-out;
            }
            .header .menu .bars:after {
                width: 2em;
                height: 5px;
                background-color: white;
                content: ' ';
                position: absolute;
                left: 0;
                top: -10px;
                border-radius: 4px;
            }
            .header .menu .bars:before {
                width: 2em;
                height: 5px;
                background-color: white;
                content: ' ';
                position: absolute;
                left: 0;
                top: 10px;
                border-radius: 4px;
            }
            .header .menu:hover .bars,
            .header .menu:hover .bars:after,
            .header .menu:hover .bars:before {
                background-color: #e5e5e5;
                box-shadow: 2px 2px 4px #383838;
            }
            .mainContent {
				width: 100%;
				background-color: #4E69A2;
				margin: 0 auto;
			}
			.mainContent>.mainContentTitle {
				font-size: 32px;
				height: 100vh;
				font-weight: 700;
				text-align: center;
			}
			.mainContent>.mainContentTitle>.text {
				padding-top: calc((100vh - 160px ) / 3);
				color: white;
				width: 80%;
				margin: 0 auto;
			}
			.mainContent>.mainContentTitle>.triangleDownCircle {
				text-align: center;
				margin-top: 15vh;
				display: none;
				
			}
			.mainContent>.mainContentPageNavigation {
				position: fixed;
				top: calc(50vh - 5em);
				right: 2em;
				display: none;
			}
			.mainContent>.mainContentPageNavigation>.pageDot {
				display: block;
				width: 1em;
				height: 1em;
				border-radius: 50%;
				background-color: white;
				margin-top: 0.75em;
				cursor: pointer;
				position: relative;
				transition: all .25s ease-in;
			}
			.mainContent>.mainContentPageNavigation>.pageDot.active {
				background-color: #F68900;
			}
			
			.mainContent>.mainContentPart {
				width: 100%;
				/*height: 100vh;*/
			}
			.mainContent>.mainContentPart:nth-child(odd) {
				background-color: #8396BD;
			}
			.mainContent>.mainContentPart>.description {
				display: inline-block;
				font-size: 24px;
				padding: 1.5em;
				color: white;
				text-align: center;
			}
			.mainContent>.mainContentPart>.image {
				margin: 0 auto;
				vertical-align: middle;
				display: inline-block;
				font-size: 16px;
				padding-top: 2em;
				padding-bottom: 2em;
				text-align: center;
			}
			.mainContent>.mainContentPart>.image>img {
				width: 99%;
				margin: 0 auto;
			}
			
			.mainContent>.mainContentPart>.mainContentPartButton {
				width: auto;
				padding: 2%;
				text-align: center;
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton {
				background-color: #FFA700;
				margin: 0 auto;
				padding: 1em 6em;
				display: inline-block;
				border-radius: 48px;
				cursor: pointer;
				box-shadow: 3px 3px #908f8f;
				font-size: 24px;
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton:hover {
				box-shadow: 1.5px 1.5px #908f8f;
				transform: translate(1.5px, 1.5px);
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton:active {
				box-shadow: 0px 0px #908f8f;
				transform: translate(3px, 3px);
			}
			.mainContent>.mainContentPart>.title {
				font-size: 32px;
				font-weight: 700;
				padding: 0.5em;
				text-align: center;
			}
			.mainContent>.mainContentPart>.customInput {
				padding-bottom: 5em;
				padding-top: 3em;
				text-align: center;
			}
			.mainContent>.mainContentPart>.customInput>input {
				font-size: 18px;
				background-color: #ecf0f1;
				width: 80%;
				padding: 1em;
				border: 2px solid #2c3e50;
				display: inline-block;
			}
			.mainContent>.mainContentPart>.customInput>.singleButton {
				display: inline-block;
				background-color: #FFA700;
				margin: 0 auto;
				padding: 1em 6em;
				width: fit-content;
				border-radius: 48px;
				cursor: pointer;
				box-shadow: 3px 3px #908f8f;
				font-size: 18px;
				margin-left: 4%;
				margin-top: 2em;
			}
			.mainContent>.mainContentPart>.customInput>.singleButton:hover {
				box-shadow: 1.5px 1.5px #908f8f;
				transform: translate(1.5px, 1.5px);
			}
			.mainContent>.mainContentPart>.customInput>.singleButton:active {
				box-shadow: 0px 0px #908f8f;
				transform: translate(3px, 3px);
			}
			.footer {
				background-color: #34495e;
				width: auto;
				color: white;
			}
			.footer>.singlePart {
				display: inline-block;
				border-right: 1px solid #85919E;
				padding: 1em 1em 1em 1.5em;
				width: 21.75%;
				vertical-align: top;
			}
			.footer .singlePart:last-child {
				border-right: none;
			}
			.footer>.singlePart>.singlePartTitle {
				font-weight: 700;
				font-size: 19px;
				padding-bottom: 1.5em;
				
			}
			.footer>.singlePart>.singlePartButton {
				color: #f39c12;
				border: 2px solid #f39c12;
				border-radius: 3px;
				padding: 0.5em 3em;
				width: fit-content;
				margin-top: 2em;
				cursor: pointer;
				transition: all 0.25se ease-in;
			}
			.footer>.singlePart>.singlePartButton:hover {
				border: 2px solid #e67e22;
				color: #e67e22;
				
			}
			.footer>.bottomFooter {
				background-color: #85919E;
				text-align: center;
				padding-top: 0.5em;
				padding-bottom: 0.5em;
			}
			
			.openFileDialog {
				display: none;
			}
			
			
            .browserBlock {
                position: fixed;
                background-color: rgba(255, 255, 255, 0.75);
                z-index: 175;
                top: 0;
                left: 0;
                height: 100vh;
                width: 100vw;
                
            }

            .browserBlock .description {
                position: relative;
                margin: 4vh auto;
                width: 60vh;
                padding: 2em;
                background-color: #D9534F;
                border-radius: 3px;
                box-shadow: 3px 3px 3px #444;
            }

            .browserBlock .tryOut {
                background-color: #ACAEB9;
                width: 60vw;
                margin-left: 20vw;
                position: absolute;
                height: 40vh;
                bottom: 25vh;
                border-radius: 3px;
                box-shadow: 3px 3px 3px #444;
            }

            .browserBlock .tryOut .title {
                font-size: 20px;
                padding-top: 1em;
                margin-left: 2em;
            }

            .browserBlock .tryOut ul {
                margin-top: 2em;
                font-size: 17px;
            }

            .browserBlock .tryOut ul li {
                padding-top: 0.15em;
                padding-bottom: 0.15em;
                display: table;
                list-style-type: circle;
                width: 60%;
                background-color: #005B96;
                margin-top: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #efefef;
            }

            .browserBlock .tryOut ul li:hover {
                background-color: #005187;
            }

            .browserBlock .tryOut ul li .symbole {
                display: table-cell;
                vertical-align: middle;
                padding-left: 0.8em;
                width: 50px;
            }

            .browserBlock .tryOut ul li .text {
                display: table-cell;
                vertical-align: middle;
                padding-top: 0.8em;
                padding-bottom: 0.8em;
                text-align: left;
            }
			.notForMobile {
				display: none;
			}
        }

        @media screen and (min-width: 737px) {
            body {
                font-family: 'Quicksand', sans-serif;
                margin: 0 auto;
                background-color: #fff;
            }

            .header {
                color: white;
                background-color: #3B5998;
                font-size: 0;
                /*box-shadow: 0px 2px 2px #b2b2b2;*/
				position: fixed;
				top: 0;
				width: 100vw;
            }

            .header .logo {
                font-size: 24px;
                display: inline-block;
                cursor: pointer;
                padding: 0.75em;
                transition: all 0.25s ease-out;
                vertical-align: top;
				margin-left: 10%;
            }

            .header .logo:hover {
                color: #3B5998;
                background-color: white;
                box-shadow: 0px 2px 2px #b2b2b2;
                cursor: pointer;
            }

            .header .logo .text {
                vertical-align: middle;
                text-align: center;
            }

            .header .title {
                font-size: 24px;
                text-align: center;
                padding: 0.75em;
                display: inline-block;
                vertical-align: top;
            }
			
			.mainContent {
				width: 100%;
				background-color: #4E69A2;
				margin: 0 auto;
			}
			.mainContent>.mainContentTitle {
				font-size: 64px;
				height: 100vh;
				font-weight: 700;
				text-align: center;
			}
			.mainContent>.mainContentTitle>.text {
				padding-top: calc((100vh - 160px ) / 3);
				color: white;
				width: 80%;
				margin: 0 auto;
			}
			.mainContent>.mainContentTitle>.triangleDownCircle {
				text-align: center;
				margin-top: 15vh;
				
			}
			.mainContent>.mainContentTitle>.triangleDownCircle svg {
				cursor: pointer;
			}
			.mainContent>.mainContentTitle>.triangleDownCircle svg ellipse {
				fill: #e5e5e5;
			}
			.mainContent>.mainContentTitle>.triangleDownCircle svg:hover ellipse {
				fill: #dcdcdc;
			}
			.mainContent>.mainContentPageNavigation {
				position: fixed;
				top: calc(50vh - 5em);
				right: 2em;
				display: none;
			}
			.mainContent>.mainContentPageNavigation>.pageDot {
				display: block;
				width: 1em;
				height: 1em;
				border-radius: 50%;
				background-color: white;
				margin-top: 0.75em;
				cursor: pointer;
				position: relative;
				transition: all .25s ease-in;
			}
			.mainContent>.mainContentPageNavigation>.pageDot.active {
				background-color: #F68900;
			}
			
			.mainContent>.mainContentPart {
				width: 100%;
				/*height: 100vh;*/
			}
			.mainContent>.mainContentPart:nth-child(odd) {
				background-color: #8396BD;
			}
			.mainContent>.mainContentPart>.description {
				display: inline-block;
				font-size: 24px;
				padding: 1.5em;
				color: white;
				width: calc(40% - 3em);
			}
			.mainContent>.mainContentPart>.image {
				width: 59%;
				vertical-align: middle;
				display: inline-block;
				font-size: 16px;
				padding-top: 2em;
				padding-bottom: 2em;
			}
			.mainContent>.mainContentPart>.image>img {
				width: 100%;
			}
			
			.mainContent>.mainContentPart>.mainContentPartButton {
				width: auto;
				padding: 2%;
				text-align: center;
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton {
				background-color: #FFA700;
				margin: 0 auto;
				padding: 1em 6em;
				display: inline-block;
				border-radius: 48px;
				cursor: pointer;
				box-shadow: 3px 3px #908f8f;
				font-size: 24px;
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton:hover {
				box-shadow: 1.5px 1.5px #908f8f;
				transform: translate(1.5px, 1.5px);
			}
			.mainContent>.mainContentPart>.mainContentPartButton>.singleButton:active {
				box-shadow: 0px 0px #908f8f;
				transform: translate(3px, 3px);
			}
			.mainContent>.mainContentPart>.title {
				font-size: 32px;
				font-weight: 700;
				padding: 0.5em;
				text-align: center;
			}
			.mainContent>.mainContentPart>.customInput {
				padding-bottom: 5em;
				padding-top: 3em;
			}
			.mainContent>.mainContentPart>.customInput>input {
				font-size: 18px;
				background-color: #ecf0f1;
				width: calc(30% - 2em);
				padding: 1em;
				margin-left: 20%;
				border: 2px solid #2c3e50;
				display: inline-block;
			}
			.mainContent>.mainContentPart>.customInput>.singleButton {
				display: inline-block;
				background-color: #FFA700;
				margin: 0 auto;
				padding: 1em 6em;
				width: fit-content;
				border-radius: 48px;
				cursor: pointer;
				box-shadow: 3px 3px #908f8f;
				font-size: 18px;
				margin-left: 4%;
			}
			.mainContent>.mainContentPart>.customInput>.singleButton:hover {
				box-shadow: 1.5px 1.5px #908f8f;
				transform: translate(1.5px, 1.5px);
			}
			.mainContent>.mainContentPart>.customInput>.singleButton:active {
				box-shadow: 0px 0px #908f8f;
				transform: translate(3px, 3px);
			}
			.footer {
				background-color: #34495e;
				width: auto;
				color: white;
			}
			.footer>.singlePart {
				display: inline-block;
				border-right: 1px solid #85919E;
				padding: 1em 1em 1em 1.5em;
				width: 21.75%;
				vertical-align: top;
			}
			.footer .singlePart:last-child {
				border-right: none;
			}
			.footer>.singlePart>.singlePartTitle {
				font-weight: 700;
				font-size: 19px;
				padding-bottom: 1.5em;
				
			}
			.footer>.singlePart>.singlePartButton {
				color: #f39c12;
				border: 2px solid #f39c12;
				border-radius: 3px;
				padding: 0.5em 3em;
				width: fit-content;
				margin-top: 2em;
				cursor: pointer;
				transition: all 0.25se ease-in;
			}
			.footer>.singlePart>.singlePartButton:hover {
				border: 2px solid #e67e22;
				color: #e67e22;
				
			}
			.footer>.bottomFooter {
				background-color: #85919E;
				text-align: center;
				padding-top: 0.5em;
				padding-bottom: 0.5em;
			}
			
			.openFileDialog {
				display: none;
			}
			
			
            .browserBlock {
                position: fixed;
                background-color: rgba(255, 255, 255, 0.75);
                z-index: 175;
                top: 0;
                left: 0;
                height: 100vh;
                width: 100vw;
                
            }

            .browserBlock .description {
                position: relative;
                margin: 4vh auto;
                width: 60vh;
                padding: 2em;
                background-color: #D9534F;
                border-radius: 3px;
                box-shadow: 3px 3px 3px #444;
            }

            .browserBlock .tryOut {
                background-color: #ACAEB9;
                width: 60vw;
                margin-left: 20vw;
                position: absolute;
                height: 40vh;
                bottom: 25vh;
                border-radius: 3px;
                box-shadow: 3px 3px 3px #444;
            }

            .browserBlock .tryOut .title {
                font-size: 20px;
                padding-top: 1em;
                margin-left: 2em;
            }

            .browserBlock .tryOut ul {
                margin-top: 2em;
                font-size: 17px;
            }

            .browserBlock .tryOut ul li {
                padding-top: 0.15em;
                padding-bottom: 0.15em;
                display: table;
                list-style-type: circle;
                width: 60%;
                background-color: #005B96;
                margin-top: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #efefef;
            }

            .browserBlock .tryOut ul li:hover {
                background-color: #005187;
            }

            .browserBlock .tryOut ul li .symbole {
                display: table-cell;
                vertical-align: middle;
                padding-left: 0.8em;
                width: 50px;
            }

            .browserBlock .tryOut ul li .text {
                display: table-cell;
                vertical-align: middle;
                padding-top: 0.8em;
                padding-bottom: 0.8em;
                text-align: left;
            }
        }
    </style>
    <script>
        $(document).ready(function () {
//			if (window.location.href.indexOf('http://')==0){
//				window.location.href = window.location.href.replace('http://','https://');
//			}
			if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1))
			{
				$(".browserBlock").show();
			}
            $(".header .logo").click(function () {
                location.reload();
            });
            if (!localStorage.openStructogramm) {
                $(".singleDiv#goOnProject").hide();
                $(".singleDiv").addClass("hidden");
            }

            $(".singleDiv").click(function () {
                switch ($(this).attr("id")) {
                    case "goOnProject":

                        break;
                    case "openProject":
                        $(".openFileDialog").click();
                        break;
                    case "newProject":
                        
                        break;
                }
            });
			$(".openStructEditor").click(function() {
				location.href = "struct.php";
			});
            $(".openFileDialog").change(function () {
                var file = document.getElementById("openFileDialog").files[0];
                var reader = new FileReader();
                reader.readAsText(file);


                reader.onload = function (evt) {
                    window.location.href = "struct.php#fileContext=" + evt.target.result +
                        "fileType=" + file.name.split('.').pop().toLowerCase();
                    //$(".mainStruct")[0].outerHTML = evt.target.result;
                }
                reader.onerror = function (evt) {
                    alert("error");
                }
            });
            if (navigator.appName == 'Microsoft Internet Explorer') {
                $(".browserBlock").show();
            } else {
                $(".browserBlock").hide();
            }

            $(document).on("change", ".mainContent>.lookAtStruct>.lookAtStructContent>input", function() {

            });
            $(document).on("click", ".openStructEditorWithCode", function() {
				var formData = new FormData();
			formData.append("structCode", $(".shareProjectCode").val());
			$.ajax({
				url: "loadStruct/loadStruct.php",
				type: 'post',
				data: formData,
				dataType: 'html',
				async: true,
				processData: false,
				contentType: false,
				success: function(data) {
					if(data == 0) {
						var stateObj = { foo: "bar" };
						history.pushState(stateObj, "Struktogramm anschauen", window.location.hostname + "/loadStruct/?structCode=" + $(".mainContent>.mainContentPart>.customInput>input").val());
						location.href = ("https://" + window.location.hostname + "/loadStruct/?structCode=" + $(".mainContent>.mainContentPart>.customInput>input").val());
						//window.location.assign(window.location.hostname + "/loadStruct/?structCode=" + $(".mainContent>.lookAtStruct>.lookAtStructContent>input").val());
					} else {
						
					}
				}
			});
            });
			
			
			$(document).on("click", ".mainContent>.mainContentTitle>.triangleDownCircle svg", function() {
				var scrollTo = (1* (parseFloat(screen.height) - 172))  + "px";
					$('html, body').animate({scrollTop: scrollTo + "px" }, 250);
			});
			var activePage = 0,
				oldY=0,
				pageY = parseFloat(screen.height),
				inScrollAction = false;
			$(document).on("click", ".mainContent>.mainContentPageNavigation>.pageDot", function() {
				pageY = parseFloat(screen.height);
				
				if(activePage < $(this).index()) {
					var scrollTo = ($(this).index()-1) * (pageY - 66)+ "px";
					$('html, body').animate({scrollTop: ($(this).index()-1) * pageY - (($(this).index()) * 66) + "px" }, 250);
					 window.scrollTo(500, 0);
				} else if(activePage > $(this).index()) {
					$('html, body').animate({scrollTop: "calc("+ ($(this).index()-1)+" * (100vh - 66px))"}, 250);
				}
				$(".mainContent>.mainContentPageNavigation>.pageDot").removeClass("active");
				$(this).addClass("active");
			});
			/*$(window).on("scroll", function(e) {
				pageY = parseFloat(screen.height);
				
				if(((parseFloat($(document).scrollTop()) / (pageY-66)) - parseInt(parseFloat($(document).scrollTop()) / (pageY-66))) > 0.6 && ! inScrollAction) {
					inScrollAction = true;
					activePage++;
					$('html, body').animate({scrollTop: (activePage-1) * pageY - ((activePage) * 66) + "px" }, 250,function() {
						inScrollAction = false;
					});
					//$('html, body').animate({scrollTop: "calc("+ ($(this).index()-1)+" * (100vh - 66px))"}, 250);activePage
				}
				//$(".mainContent>.mainContentPageNavigation>.pageDot").removeClass("active");
				$(".mainContent>.mainContentPageNavigation .pageDot:nth-child("+ (parseInt(parseFloat($(document).scrollTop()) / (pageY-66)) +1) +")").addClass("active");
			});*/
        });
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

<body>
    <div class="header">
        <div class="logo">
            <div class="text">S;</div>
        </div>
        <div class="title">Structorizer</div>
        <div class="menu">
            <div class="bars"></div>
        </div>
    </div>
    <div class="mainContent">
		<div class="mainContentPageNavigation">
			<div class="activePageDot"></div>
			<div class="pageDot"></div>
			<div class="pageDot"></div>
			<div class="pageDot"></div>
			<div class="pageDot"></div>
		</div>
		<div class="mainContentTitle">
			<div class="text">
				Struktogramme einfach erstellen,<br>
				bearbeiten und teilen.
			</div>
			<div class="triangleDownCircle">
				<svg height="192" width="192">
	<ellipse cx="96" cy="96" rx="96" ry="96" />
    <line x1="40" y1="60" x2="96" y2="150" stroke-linecap="round"  style="stroke:#4E69A2;stroke-width:12" />
    <line x1="156" y1="60" x2="96" y2="150" stroke-linecap="round"  style="stroke:#4E69A2;stroke-width:12" />
</svg>
			</div>
		</div>
		<div class="mainContentPart">
			<div class="description">
				Mit dem &uuml;bersichtlich gestalteten Interface ist es kinderleicht ein Struktogramm zu erstellen.
			</div>
			<div class="image">
				<img src="images/userInterface.PNG" />
			</div>
		</div>
		<div class="mainContentPart notForMobile">
			<div class="title">Loslegen</div>
			<div class="mainContentPartButton">
				<div class="singleButton openStructEditor">Struktogrammeditor &ouml;ffnen</div>
			</div>
		</div>
		<div class="mainContentPart">
			<div class="title">Projekt ansehen</div>
			
			<div class="customInput">
				<input type="text" class="shareProjectCode" placeholder="Projekt-Code"/>
				<div class="singleButton openStructEditorWithCode">Projekt &ouml;ffnen</div>
			</div>
		</div>
    </div>
	
    <div class="footer">
		<!--<div class="singlePart">
			<div class="singlePartTitle">Links</div>
		</div>
		<div class="singlePart">
			<div class="singlePartTitle">Updates</div>
		</div>
		<div class="singlePart">
			<div class="singlePartTitle">Email-Updates</div>
			<div class="singlePartDescription">Erhalte Nachrichten &uuml;ber den Structorizer per email.</div>
		</div>
		<div class="singlePart" style="border-right: none;">
			<div class="singlePartTitle">Kontaktiere uns</div>
			<a class="singlePartButton">EMAIL</a>
		</div>-->
		<div class="bottomFooter">
			<div class="text">&#9400; Copyright - 2017 Janis Huser - Alle Rechte vorbehalten</div>
		</div>
        
    </div>

	
	
	
	
	
	
    <input type="file" class="openFileDialog" id="openFileDialog" accept=".structIo,.7, .nsd" />

    <div class="browserBlock">
        <div class="description">Es tut uns leid, dein aktueller Browser wird von dieser Plattform nicht unterst&uuml;tzt.</div>
        <div class="tryOut">
            <div class="title">Um die Plattform nutzen zu k&ouml;nnen bitten wir dich einen der folgenden Browser zu nutzen:</div>
            <ul>
                <li onclick="window.open('https://www.google.com/chrome/browser/desktop/index.html','_blank','','')">
                    <div class="symbole">
                        <svg enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.0" viewBox="0 0 32 32" width="32px" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g>
                                <path d="M16,24.188c-1.625,0-3.104-0.438-4.438-1.312c-1.334-0.875-2.334-2-3-3.375L2,8c-1.375,2.459-2,5.209-2,8   c0,4,1.302,7.49,3.906,10.469c2.604,2.979,5.844,4.76,9.719,5.344l4.641-8.031C17.799,23.919,17.02,24.188,16,24.188z"
                                    fill="#4AAE48" />
                                <path d="M10.969,9.531C12.447,8.386,14.125,8,16,8c0.25,0,13.75,0,13.75,0c-1.417-2.416-3.344-4.458-5.781-5.875   C21.531,0.709,18.875,0,16,0c-2.5,0-4.834,0.531-7,1.594C6.833,2.656,4.828,4.203,3.359,6.188L8,14   C8.458,12.209,9.489,10.678,10.969,9.531z"
                                    fill="#EA3939" />
                                <path d="M30.797,10H21.5c1.625,1.625,2.688,3.709,2.688,6c0,1.709-0.479,3.271-1.438,4.688L16.188,32   c4.375-0.042,8.104-1.625,11.188-4.75C30.458,24.125,32,20.375,32,16C32,13.959,31.656,11.812,30.797,10z"
                                    fill="#FED14B" />
                                <circle cx="16" cy="16" fill="#188FD1" r="6" />
                            </g>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                        </svg>
                    </div>
                    <div class="text">Google Chrome</div>
                </li>
                <li onclick="window.open('https://www.mozilla.org/de/firefox/new/?scene=2','_blank','','')">
                    <div class="symbole">
                        <svg enable-background="new -0.002 -0.501 32 31" height="31" viewBox="-0.002 -0.501 32 31" width="32" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.998-.501c8.284 0 15 6.715 15 15 0 8.283-6.716 15-15 15s-15-6.717-15-15c0-8.286 6.716-15 15-15z" fill="#2394BC"
                            />
                            <path d="M18.562 30.274c7.614-1.229 13.437-7.814 13.437-15.775l-.146.181c.228-1.513.188-2.861-.125-4.037-.112.871-.234 1.397-.357 1.608-.001-.068-.018-.976-.307-2.243-.137-.924-.338-1.793-.616-2.596.068.368.108.675.128.953-1.162-3.118-4.023-6.957-11.072-6.867 0 0 2.479.262 3.646 2.029 0 0-1.193-.285-2.095.152 1.099.438 2.052.896 2.863 1.374l.07.043c.208.125.385.253.573.38 1.498 1.052 2.888 2.553 2.782 4.489-.323-.51-.753-.844-1.304-1.012.679 2.66.746 4.857.197 6.59-.377-1.154-.724-1.846-1.033-2.09.431 3.566-.15 6.203-1.739 7.922.302-1.049.422-1.908.354-2.586-1.867 2.822-3.991 4.281-6.372 4.371-.941-.008-1.83-.15-2.666-.426-1.228-.415-2.339-1.124-3.328-2.13 1.544.129 2.954-.139 4.195-.772l2.033-1.332-.008-.006c.264-.1.512-.092.754.021.496-.068.67-.334.504-.783-.24-.334-.603-.637-1.069-.904-1.017-.531-2.079-.447-3.187.26-1.055.6-2.07.576-3.058-.062-.647-.447-1.272-1.049-1.876-1.801l-.24-.355c-.113.852.015 1.945.398 3.291l.008.018-.008-.016c-.384-1.346-.511-2.442-.398-3.293v-.008c.029-.744.337-1.154.924-1.246l-.249-.021.251.021c.663.061 1.424.213 2.282.463.144-.828-.045-1.695-.564-2.584v-.016c.806-.752 1.521-1.299 2.132-1.648.271-.145.429-.365.481-.662l.022-.016.008-.008.03-.029c.158-.236.105-.426-.165-.594-.565.031-1.131-.008-1.695-.121l-.008.023c-.233-.068-.527-.275-.889-.625l-.927-.912-.278-.219v.029h-.008l.008-.037-.053-.055.075-.053c.128-.691.339-1.285.64-1.795l.068-.061c.302-.502.881-1.041 1.732-1.617-1.582.197-3.013.91-4.285 2.143-1.055-.387-2.305-.305-3.744.25l-.173.132-.013.007.188-.138.008-.008c-.905-.416-1.515-1.611-1.809-3.564-1.152 1.141-1.71 3.178-1.673 6.119l-.33.499-.085.058-.017.016-.007.007-.016.033c-.175.274-.416.688-.72 1.244-.437.786-.584 1.446-.627 2.021l-.004.007.002.019-.014.151.025-.04c.003.133.006.267.04.387l.934-.768c-.339.859-.564 1.77-.678 2.736l-.027.442-.293-.335c0 3.428 1.088 6.597 2.924 9.201l.055.086.088.105c1.32 1.813 3.006 3.338 4.958 4.464 1.403.831 2.911 1.413 4.519 1.759l.331.074c.333.064.674.112 1.016.155.253.033.506.065.762.087l.34.039.483.003.525.026.418-.021.689-.034c.409-.028.812-.073 1.212-.131l.243-.036zm-9.409-16.75h0zm19.527-2.741l-.007.131.005-.132.002.001z"
                                fill="#EC8840" />
                        </svg>
                    </div>
                    <div class="text">Mozilla Firefox</div>
                </li>
                <li onclick="window.open('http://www.opera.com/de','_blank','','')">
                    <div class="symbole">
                        <svg enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.0" viewBox="0 0 32 32" width="32px" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g>
                                <path d="M26.737,4.375c2.842,2.917,4.264,6.75,4.264,11.5c0,4.334-1.422,8.104-4.264,11.312   C23.895,30.396,20.295,32,15.938,32c-4.316,0-7.885-1.604-10.706-4.812C2.41,23.979,1,20.209,1,15.875   c0-4.75,1.39-8.583,4.171-11.5C7.95,1.459,11.54,0,15.938,0C20.295,0,23.895,1.459,26.737,4.375z M21.291,11.062   c-0.124-1.291-0.373-2.552-0.747-3.781c-0.373-1.229-0.944-2.177-1.711-2.844c-0.769-0.666-1.733-1-2.895-1   c-1.162,0-2.116,0.323-2.863,0.969C12.328,5.053,11.778,6,11.426,7.25S10.835,9.75,10.71,11c-0.124,1.25-0.187,2.771-0.187,4.562   c0,1.125,0.021,2.073,0.062,2.844c0.04,0.771,0.113,1.709,0.218,2.812c0.103,1.104,0.27,2.031,0.498,2.781   c0.228,0.75,0.538,1.49,0.934,2.219c0.394,0.729,0.902,1.281,1.524,1.656s1.348,0.562,2.179,0.562c0.829,0,1.565-0.188,2.21-0.562   c0.643-0.375,1.161-0.927,1.556-1.656C20.098,25.49,20.42,24.75,20.669,24s0.436-1.677,0.56-2.781   c0.125-1.104,0.197-2.052,0.219-2.844c0.02-0.791,0.03-1.729,0.03-2.812C21.478,13.854,21.416,12.354,21.291,11.062z"
                                    fill="#EA3939" />
                            </g>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                            <g/>
                        </svg>
                    </div>
                    <div class="text">Opera</div>
                </li>
                <li onclick="window.open('https://www.microsoft.com/en-us/download/details.aspx?id=48126','_blank','','')">
                    <div class="symbole">
                        <svg height="32px" id="Layer_1" style="enable-background:new 0 0 56.6934 56.6934;" version="1.1" viewBox="0 0 56.6934 56.6934"
                            width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <path d="M28.7412,4.165c-13.5996,0-24.625,11.0234-24.625,24.623c0,13.5997,11.0254,24.625,24.625,24.625  c13.5986,0,24.624-11.0253,24.624-24.625C53.3652,15.1883,42.3398,4.165,28.7412,4.165z M41.9575,30.8284  c-6.0128,0-11.9988,0-18.0048,0c0.0069,1.4767,0.4367,2.749,1.4282,3.8059c1.1519,1.2278,2.6302,1.8243,4.2499,2.0604  c3.3999,0.4956,6.6022-0.1252,9.5894-1.8317c0.0765-0.0437,0.1527-0.0879,0.2296-0.131c0.0076-0.0042,0.0188-0.0019,0.0645-0.0053  c0.0063,0.103,0.0181,0.2059,0.0181,0.309c0.0007,1.8137-0.0035,3.6275,0.0047,5.4412c0.0009,0.208-0.0663,0.3161-0.2502,0.4077  c-2.1419,1.0676-4.4089,1.6771-6.7912,1.8618c-1.5177,0.1176-3.0309,0.1185-4.5336-0.1862  c-4.5213-0.9166-8.1275-4.2271-8.955-8.8836c-0.9442-5.3137,1.5848-10.2199,6.6656-12.3896  c0.0158-0.0067,0.037-0.0008,0.1094-0.0008c-1.1304,1.2846-1.7167,2.7681-1.9387,4.4459c3.4016,0,6.7669,0,10.1574,0  c0-0.2484,0.0134-0.5005-0.0023-0.7509c-0.0687-1.0956-0.3043-2.147-0.9025-3.0854c-0.8016-1.2572-2.005-1.883-3.4371-2.1138  c-2.0781-0.3348-4.0831,0.0198-6.0313,0.7296c-2.8502,1.0385-5.2435,2.7353-7.148,5.1042  c-0.3201,0.3982-0.6049,0.8247-0.9561,1.3068c0.0291-0.2396,0.0458-0.4125,0.0715-0.584c0.4104-2.7437,1.3984-5.2465,3.1768-7.3956  c2.09-2.5257,4.7835-4.0219,8.0142-4.5433c3.1469-0.5078,6.1235,0.0027,8.8864,1.6029c2.5432,1.473,4.2961,3.6315,5.3425,6.3668  c0.6035,1.5776,0.8983,3.2173,0.9136,4.9067c0.0096,1.0641,0.0194,2.1282,0.0289,3.1923  C41.9583,30.5747,41.9575,30.6811,41.9575,30.8284z"
                            />
                        </svg>
                    </div>
                    <div class="text">Microsoft Edge</div>
                </li>
            </ul>
        </div>

    </div>
</body>

</html>