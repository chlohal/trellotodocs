var request = require("request");
var fs = require("fs");
var cp = require("child_process");
var wildmatch = require("wildmatch");

var defaultRepo = "@nhs-t10/delta-v";

module.exports = function(owner, repo, blob, topLevelCallback) {

    cp.exec("git show " + escapeShell(blob) + " | cat", {cwd: __dirname + "/.repocache/" + owner + "/" + repo}, function(err, stdout, stderr) {
        if(typeof stdout != "string") stdout = stdout.toString();

        if(err || stderr) topLevelCallback(null);
        else topLevelCallback(stdout);
    });
};

function escapeShell(str) {
    return str.replace(/(.)/, "\\$1");
}
