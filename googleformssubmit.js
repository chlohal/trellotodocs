var fs = require("fs");
var request = require("request");

module.exports = function(formId, formData, cookie, callback) {
if(formData.constructor == Array) {

    function asyncForEachPage(pageIndex) {
        let currentPageForm = formData[pageIndex];
        currentPageForm.fvv = "1";
        currentPageForm.draftResponse = "[]";
        currentPageForm.pageHistory = (new Array(pageIndex+1)).fill(0).map((x,i)=>i).join(",");
        currentPageForm.fbzx = "-3287908011779677250";

        if(pageIndex < formData.length - 1) currentPageForm["continue"] = 1;

        request.post("https:\/\/docs.google.com/forms/u/"+require(__dirname + "/auth.json").googleAuthUser+"/d/e/"+formId+"/formResponse",
        {form: currentPageForm,
        headers: {
            "cookie": cookie
        }},
        function(err, res, bod) {
            console.log(res.status);
            if(err) console.log(err&&callback(err));
            else if(pageIndex < formData.length - 1) asyncForEachPage(pageIndex+1);
        });
    }

    asyncForEachPage(0);
}
else {

formData.fvv = "1";
formData.draftResponse = "[]";
formData.pageHistory = "0";
formData.fbzx = "-3287908011779677250";

request.post("https:\/\/docs.google.com/forms/u/"+require(__dirname + "/auth.json").googleAuthUser+"/d/e/"+formId+"/formResponse",
    {form: formData,
    headers: {
        "cookie": cookie
    }},
    callback
    );
}
}
