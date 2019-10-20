var request = require("request");

var defaultRepo = "@nhs-t10/delta-v";
module.exports = function(path, callback) {
    let tokenizedPath = path.split(/\/| /);

    let repo = defaultRepo;

    let specifiedRepo = false;
    let fullRepoSearch = false;

    let fileName;
    let pathSearch;

     if(path.charAt(0) == "@") {
        repo = tokenizedPath[0] + "/" + tokenizedPath[1];
        specifiedRepo = true;
    }
    if(tokenizedPath[tokenizedPath.length - 1].indexOf(".") != -1) {
        fileName = tokenizedPath[tokenizedPath.length - 1];
    } else if(tokenizedPath.length < 3) {
        fullRepoSearch = true;
    } else if(tokenizedPath[tokenizedPath.length - 1].indexOf("*")) {
        fullRepoSearch = true;
    }

    if(!repo) return null;

    request("https:\/\/api.github.com/search/"+(fullRepoSearch?"repositories":"code")+"?q=sort:updated"+(fullRepoSearch?"":"+filename:"+fileName)+"+repo:"+repo.substring(1), {headers: {"User-Agent": "coleh2"}}, function(err, res, bod) {
        if(err) callback(err,null);
        else callback(err, JSON.parse(bod));
    });
};
