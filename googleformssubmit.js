var fs = require("fs");

module.exports = function(formId, formData, cookie, callback) {
formData.fvv = "1";
formData.draftResponse = "[]";
formData.pageHistory = "0";
formData.fbzx = "8621844605317760714";

request.post("https://docs.google.com/forms/d/e/"+formId+"/formResponse", 
    {form: formData,
    headers: {
        "cookie": cookie
    }},
    callback
    );
}
