var request = require("request");
var fs = require("fs");
var cp = require("child_process");
var wildmatch = require("wildmatch");

var defaultRepo = "@nhs-t10/delta-v";

module.exports = function(path, topLevelCallback) {
    let paths = path.split(/;\s+/);

    let repo = parseFileRepo(paths[0]);

    paths = paths.map(a=>parseFilePath(a));

    let repoOwnerPath = __dirname + "/.repocache/" + repo.owner;

    if(!fs.existsSync(repoOwnerPath)) fs.mkdirSync(repoOwnerPath);

    if(!fs.existsSync(repoOwnerPath + "/" + repo.repo)) cp.exec("git clone https:\/\/github.com/" + escapeShell(repo.owner) + "/" + escapeShell(repo.repo) + ".git", {cwd: repoOwnerPath}, gitUpdateCallback);
    else cp.exec("git pull", {cwd: repoOwnerPath + "/" + repo.repo}, gitUpdateCallback);

function gitUpdateCallback(err, stdout, stderr) {
    if(stderr) return topLevelCallback(stderr);

    cp.exec("git log -n 1 --pretty=\"format:%H\" -- " + paths.map(b=>escapeShell(b)).join(" ")  +
            " && echo --TRELLOTODOCSGITPARSINGBOUNDRY-- && git diff $(git log -n 2 --pretty=\"format:%H\" -- " +
            paths.map(b=>escapeShell(b)).join(" ") +
            ") --no-color --numstat | cat", {cwd: repoOwnerPath + "/" + repo.repo}, function(err, stdout, stderr) {
         if(typeof stdout != "string") stdout = stdout.toString();
         console.log(stdout);
         let diffSummaries = stdout.split("--TRELLOTODOCSGITPARSINGBOUNDRY--").slice(1).join("--TRELLOTODOCSGITPARSINGBOUNDRY--").split("\n").map(c=>c.split(/\s+/));
         diffSummaries.forEach(d=>d[2]=d.slice(2).join(" "));

         let fileDiffs = {};
         let completedFileCount = 0;

         for(let i = 0; i < paths.length; i++) {
             let currentPath = paths[i];
             let largestChangeCount = -1;
             let largestChangeFile = diffSummaries[0][2].trim();

             for(let j = 0; j < diffSummaries.length; j++) {
                 if(matchesSpec(currentPath, diffSummaries[j][2]) && largestChangeCount < parseInt(diffSummaries[j][1]) + parseInt(diffSummaries[j][0])) {
                     largestChangeFile = diffSummaries[j][2].trim();
                     largestChangeCount = parseInt(diffSummaries[j][0]) + parseInt(diffSummaries[j][1]);
                 }
             }
             console.log('lcf',largestChangeFile);

             cp.exec("git show " + stdout.split("--TRELLOTODOCSGITPARSINGBOUNDRY--")[0] + ":" + largestChangeFile + " | cat", {cwd: repoOwnerPath + "/" + repo.repo}, function(showErr, showStdout, showStderr) {
                 if(showErr || showStderr) return topLevelCallback(showErr || showStderr);

                 completedFileCount++;

                 if(typeof showStdout != "string") showStdout = showStdout.toString();
                 fileDiffs[largestChangeFile] = {
                     text: showStdout,
                     rank: largestChangeCount,
                     url: require(__dirname + "/auth.json").domain + "/renderblob/" + repo.owner + "/" + repo.repo + "?file=" + encodeURIComponent(stdout.split("--TRELLOTODOCSGITPARSINGBOUNDRY--")[0] + ":" + largestChangeFile)
                 }

                 if(completedFileCount = paths.length) topLevelCallback(null, fileDiffs);
             });
         }
    });
}
}
function matchesSpec(spec, path) {
    return wildmatch(path, spec, {matchBase: true});
}
function escapeShell(str) {
    return str.replace(/(.)/, "\\$1");
}

function parseFileRepo(ref) {
    let tokenizedRef = ref.split("/");

    if(!tokenizedRef[0].startsWith("@")) return parseFileRepo(defaultRepo);

    return {
        owner: tokenizedRef[0].substring(1),
        repo: tokenizedRef[1]
    }
}

function parseFilePath(ref) {
    let tokenizedRef = ref.split("/");

    if(tokenizedRef[0].startsWith("@")) return tokenizedRef.slice(2).join("/");
    else return ref;
}
