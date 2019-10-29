var app = require('express')();
var server = require('http').Server(app);
var fs = require("fs");
var request = require("request");
var concat = require('concat-stream');

var auth = require(__dirname + "/auth.json");

function associateTrelloUser(userObj) {
    return require(__dirname + "/trelloUsers.json").find(x=>x.id==(userObj||{}).id) || {};
}
var submitGoogleForm = require(__dirname + "/googleformssubmit.js");
var uploadFileToGoogle = require(__dirname + "/googlefileupload.js");
var recognizeGithubPath = require(__dirname + "/_experimental_githubpathrecog.js");
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
app.get("/renderedtext", function(req, res) {
    res.sendFile(__dirname + "/ftc_doc.png");
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
            let documentor = associateTrelloUser({id:bodyParse.action.idMemberCreator}).realName || "Robo Jones";
            let githubFilePath = cardBody.customFieldItems.find(x=>x.idCustomField=="5da6e15f9c98160fd8581746").value.text;

            recognizeGithubPath(githubFilePath, function(err, githubFilesObj) {
                if(err) return console.error("Github recog error",err);
                if(!githubFilesObj[Object.keys(githubFilesObj)[0]]) return console.error("No file");

                let githubFileNames = Object.keys(githubFilesObj);
                let githubDifferenceText = githubFilesObj[githubFileNames[0]].text;
                let githubDifferenceFile = githubFileNames[0];

                for(let i = 0; i < githubFileNames.length; i++) {
                    if(githubFilesObj[githubFileNames[i]].text.length > githubDifferenceText.length) { 
                        githubDifferenceText = githubFilesObj[githubFileNames[i]];
                        githubDifferenceFile = githubFileNames[i];
                    }
                }

                    let imgBuffer = renderText(githubDifferenceFile, githubDifferenceText);
                    fs.writeFileSync("ftc_doc.png", imgBuffer);

                    uploadFileToGoogle(imgBuffer, auth.googleCookie, "ftc_doc.png", function(err, data) {
                        let jsonData = JSON.parse(data);
                        let imageId = jsonData.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.id;

                        let formImageSubmitString = JSON.stringify([[[imageId,"ftc_doc.png","image/png"]]]);
                        let formData = {};

                        formData[auth.formFieldMedia] = formImageSubmitString;
                        formData[auth.formFieldMembers] = peopleWhoWorkedOnIt.join(", ");
                        formData[auth.formFieldFeature] = featureName;
                        formData[auth.formFieldProgress] = dayProgress;
                        formData[auth.formFieldDocumentor] = documentor;
                        formData[auth.formFieldDate + "_year"] = day.getFullYear();
                        formData[auth.formFieldDate + "_month"] = day.getMonth() + 1;
                        formData[auth.formFieldDate + "_day"] = day.getDate();

                        console.log(formData);

                        submitGoogleForm(auth.docFormId, formData, auth.googleCookie, function(err, res, dat) {
                            if(err) console.error(err);
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
