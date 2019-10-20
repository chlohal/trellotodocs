var request = require("request");
var JsDOM = require("jsdom").JSDOM;

var patchRegex = /\+\d+,(\d+)/;
module.exports = function(commitUrl, fileName, callback) {
    request(commitUrl, function(err, res, bod) {
        var dom = new JsDOM(bod).window.document;

        let diffs = Array.from(dom.querySelectorAll(".file"));

        let releventDiff = diffs.find(x=>((x.querySelector(".file-header").getAttribute("data-path")||"").includes(fileName)));

        if(!releventDiff) return callback("Diff not found");

        let releventDiffPatches = Array.from(releventDiff.querySelectorAll(".blob-code-hunk"));
        let largestPatch = releventDiffPatches.sort((a,b)=>(parseInt(patchRegex.exec(b.innerHTML)[1])-parseInt(patchRegex.exec(a.innerHTML)[1])))[0];

        let lineCount = parseInt(patchRegex.exec(largestPatch.innerHTML)[1]);
        let diffText = "";

        if(lineCount == 0) lineCount = parseInt((/-\d+,(\d+)/).exec(largestPatch.innerHTML)[1])
        let currentLineElem = largestPatch.parentElement.nextSibling;
        for(var i = 0; i < lineCount; i++) {
            if(currentLineElem.textContent.replace(/\s/g,"").length != 0) diffText += currentLineElem.textContent.replace(/\n/g,"")+"\n";
            else i--;
            currentLineElem = currentLineElem.nextSibling;
            if(!currentLineElem) {
                break;
                lineCount = -1;
            }
        }
        diffText = diffText.substring(0,diffText.length - 1);
        callback(null, diffText);
    });
}
