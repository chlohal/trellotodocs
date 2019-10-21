var createCanvas = require("canvas").createCanvas;

module.exports = function(text) {
    var canvasHeight = text.split("\n").length * 12 + 8;
    var canvas = createCanvas(512,canvasHeight);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#222222";
    ctx.fillRect(0,0,512,canvasHeight);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#fefefe";
    ctx.fillText(text, 4, 4);

    return canvas.toBuffer("image/png");
};
