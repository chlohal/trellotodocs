var app = require('express')();
var server = require('http').Server(app);
var fs = require("fs");
var request = require("request");

var concat = require('concat-stream');


function associateTrelloUser(userObj) {
    return require(__dirname + "/trelloUsers.json").find(x=>x.id==userObj.id) || {};
}
var submitGoogleForm = require(__dirname + "/googleformssubmit.js");
var uploadFileToGoogle = require(__dirname + "/googlefileupload.js");
var recognizeGithubPath = require(__dirname + "/githubpathrecog.js");
var processGithubDiff = require(__dirname + "/githubdiffcalc.js");
var renderText = require(__dirname + "/rendertext.js");

app.use(function(req, res, next){
    req.pipe(concat(function(data){
        req.body = data;
        next();
    }));
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/webhook", function(req,res) {
    let body = req.body.toString();
    try {
        var bodyParse = JSON.parse(body);
    } catch (e) {
        return res.sendStatus(400);
    }
    if(!bodyParse.action)  return res.sendStatus(200);
    console.log("Event!", bodyParse.action.data);
    if(bodyParse.action.type == "commentCard") {
        request("https:\/\/api.trello.com/1/cards/" + bodyParse.action.data.card.id + "?attachments=true&attachment_fields=all&members=true&membersVoted=false&checkItemStates=false&checklists=all&checklist_fields=all&board=false&list=true&pluginData=true&stickers=true&sticker_fields=all&customFieldItems=true&key="+auth.trelloKey+"&token="+auth.trelloToken, function(err, res, bod) {
            let cardBody = JSON.parse(bod);

            let peopleWhoWorkedOnIt = cardBody.members.map(x=>(associateTrelloUser(x).realName || ""));
            let featureName = bodyParse.action.data.card.name;
            let dayProgress = bodyParse.action.data.text;
            let day = new Date();
            let documentor = associateTrelloUser(bodyParse.action.memberCreate).realName || "Robo Jones";
            let githubFilePath = cardBody.customFields.find(x=>x.idCustomField=="5da6e15f9c98160fd8581746").value.text;

            recognizeGithubPath(githubFilePath, function(err, githubFileObj) {
                if(err) return false;
                if(!githubFileObj.items[0]) return false;

                let githubHtmlUrl = githubFileObj.items[0].html_url;
                let tokenizedHtmlUrl = githubHtmlUrl.split("/");
                let blobHashIndex = tokenizedHtmlUrl.indexOf("blob") + 1;
                if(!blobHashIndex) return;
                tokenizedHtmlUrl[blobHashIndex - 1] = "commit";
                let commitUrl = tokenizedHtmlUrl.slice(0,blobHashIndex + 1).join("/");
                processGithubDiff(commitUrl, githubFileObj.items[0].name, function(err, githubDifferenceText) {
                    if(err) return false;

                    let imgBuffer = renderText(githubDifferenceText);

                    uploadFileToGoogle(imgBuffer, auth.googleCookie, "ftc_doc.png", function(err, data) {
                        let jsonData = JSON.parse(data);
                        let imageId = jsonData.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.id;

                        let formImageSubmitString = "[[[\\\""+imageId+"\\\",\\\"ftc_doc.png\\\",\\\"image/png\\\"]]]";
                        let formData = {};

                        formData[auth.formFieldMedia] = formImageSubmitString;
                        formData[auth.formFieldMembers] = peopleWhoWorkedOnIt.join(", ");
                        formData[auth.formFieldFeature] = featureName;
                        formData[auth.formFieldProgress] = dayProgress;
                        formData[auth.formFieldDocumentor] = documentor;
                        formData[auth.formFieldDate + "_year"] = day.getFullYear();
                        formData[auth.formFieldDate + "_month"] = day.getMonth() + 1;
                        formData[auth.formFieldDate + "_day"] = day.getDate();

                        submitGoogleForm(auth.docFormId, formData, auth.googleCookie, function(err, res, dat) {
                            if(err) console.error(err);
                        });
                    });
                });
            });
        });
    }

    res.sendStatus(200);
});

app.all("/webhook", function(req, res) {
    res.sendStatus(200);
});
server.listen(5567);
