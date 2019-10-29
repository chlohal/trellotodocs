var createCanvas = require("canvas").createCanvas;

module.exports = function(name, text) {
    var canvas = createCanvas(512,512);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#333333";
    ctx.fillRect(0,0,512,512);

    ctx.fillStyle = "#3f3f3f";
    ctx.fillRect(0,0,512,18);

    ctx.fontAlign = "end";
    ctx.font = "12px Lato";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ececec";
    ctx.fillText(name, 2, 2);

    ctx.font = "12px FreeMono";
    ctx.fillText(text, 2, 20);

    return canvas.toBuffer("image/png");
};
