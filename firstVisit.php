<html>
	<head>
		<style>
			.firstVisitContent {
				width: 100%;
				height: 100%;
				font-size: 0;
				overflow: hidden;
			}
			.firstVisitContent>.backwards {
				font-size: 16px;
				display: inline-block;
				width: 15%;
				height: 100%;
				cursor: pointer;
				overflow: hidden;
			}
			.firstVisitContent>.backwards:hover,
			.firstVisitContent>.forwards:hover {
				background-color: rgba(255,255,255,0.2);
			}
			.firstVisitContent>.content {
				font-size: 16px;
				display: inline-block;
				width: 70%;
				height: 100%;
				overflow: hidden;
				
			}
			.firstVisitContent>.forwards {
				font-size: 16px;
				display: inline-block;
				width: 15%;
				height: 100%;
				overflow: hidden;
				cursor: pointer;
			}
			.firstVisitContent>.content>.firstVisitContainer {
				width: 100%;
				height: 85%;
				padding-bottom: 5%;
				font-size: 16px;
				position: relative;
			}
			.firstVisitContent>.content>.firstVisitContainer>.singlePage {
				height: 100%;
				width: 100%;
				display: inline-block;
				font-size: 16px;
				transition: all 0.2s linear;
				position: absolute;
			}
			.firstVisitContent>.content>.firstVisitContainerPage {
				width: 100%;
				height: 10%;
				font-size: 16px;
				text-align: centeR;
			}
			
			.firstVisitContent>.content>.firstVisitContainerPage>.dot {
				width: 1em;
				margin-left: 0.25em;
				margin-right: 0.25em;
				height: 1em;
				background-color: white;
				display: inline-block;
				border-radius: 16px;
				cursor: pointer;
				vertical-align: middle;
				margin-top: 4%;
			}
			.firstVisitContent>.content>.firstVisitContainerPage>.dot:hover {
				background-color: #bdc3c7;
			}
			.firstVisitContent>.content>.firstVisitContainerPage>.dot.active {
				background-color: #3498db;
			}
		</style>
		<script>
			$(document).on("click", ".firstVisitContent>.content>.firstVisitContainerPage>.dot", function() {
				
				if( $(".firstVisitContent>.content>.firstVisitContainerPage>.dot.active").index()< $(this).index()) {
					for(var i=$(".firstVisitContent>.content>.firstVisitContainerPage>.dot.active").index(); i <= $(this).index(); i++) {
						firstVisit_previousPage ();
						firstVisit_activePage++;
					}
					
				} else if($(".firstVisitContent>.content>.firstVisitContainerPage>.dot.active").index() > $(this).index()) {
					for(var i=$(this).index(); i <= $(".firstVisitContent>.content>.firstVisitContainerPage>.dot.active").index(); i++) {
						firstVisit_nextPage ();
						firstVisit_activePage--;
					}
					firstVisit_nextPage();
					firstVisit_activePage--;								
	

					
				}
				console.log($(".firstVisitContent>.content>.firstVisitContainerPage>.dot.active").index());
				console.log($(this).index());
				$(".firstVisitContent>.content>.firstVisitContainerPage>.dot").removeClass("active");
				$(this).addClass("active");
				
				
			});
			$(window).resize(function() {
				firstVisit_singlePageWidth = $(".firstVisitContainer").css("width");
			});
			setTimeout(function() {
				firstVisit_singlePageWidth = $(".firstVisitContainer").css("width");
			},50);
			var firstVisit_singlePageWidth = $(".firstVisitContainer").css("width");
			var firstVisit_activePage = 1;
			function firstVisit_nextPage() {
				$(".firstVisitContent>.content>.firstVisitContainer>.singlePage:nth-child(" + firstVisit_activePage +")").css({
					width: "0px",
					marginLeft: firstVisit_singlePageWidth
				});
				$(".firstVisitContent>.content>.firstVisitContainer>.singlePage:nth-child(" + (firstVisit_activePage+1) +")").css({
					width: firstVisit_singlePageWidth,
					marginLeft: "0px"
				});
			}
			function firstVisit_previousPage() {
				$(".firstVisitContent>.content>.firstVisitContainer>.singlePage:nth-child(" + firstVisit_activePage +")").css({
					width: "0px",
					marginLeft: firstVisit_singlePageWidth
				});
				$(".firstVisitContent>.content>.firstVisitContainer>.singlePage:nth-child(" + (firstVisit_activePage+1) +")").css({
					width: firstVisit_singlePageWidth,
					marginLeft: "0px"
				});
			}
		</script>
	</head>
	<body>
		<div class="firstVisitContent">
			<div class="backwards">

			</div>
			<div class="content">
				<div class="firstVisitContainer">
					<div class="singlePage" style="background-color: red;"></div>
					<div class="singlePage" style="background-color: lime; width: 0;"></div>
					<div class="singlePage" style="background-color: blue; width: 0;"></div>
					<div class="singlePage" style="background-color: yellow; width: 0;"></div>
				</div>
				<div class="firstVisitContainerPage">
					<div class="dot active"></div>
					<div class="dot"></div>
					<div class="dot"></div>
					<div class="dot"></div>
				</div>
			</div>
			<div class="forwards">
			</div>
		</div>
	</body>
</html>