var socket = io();

var stage;


stage = new createjs.Stage("canvas");

var grid = new createjs.Shape();	
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3 * 2, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3, parseFloat(document.getElementById("canvas").width), 2);
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3 * 2, parseFloat(document.getElementById("canvas").width), 2);
stage.addChild(grid);
stage.update();

stage.on("stageonclick", CreateXO);

function CreateXO(evt) {
	let X = 300 * Math.floor(evt.pageX / 300) + 150;
	let Y = 300 * Math.floor(evt.pageY / 300) + 150;
	var data = {
        images: ["/static/xo.png"],
        frames: {width:150, height:150},
		animations: {
            cross: 0,
			circle: 1
		}
    };
    var spriteSheet = new createjs.SpriteSheet(data);
    var cross = new createjs.Sprite(spriteSheet, "cross");
	cross.regX = 75;
	cross.regY = 75;
	cross.x = X;
	cross.y = Y;
	stage.addChild(cross);
	stage.update();
}
	
	