require("./trelloUsers.json");
require("./auth.json");

require("./googlefileupload.js")(Buffer.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")), require("./auth.json").googleToken, "test_pixel.png", function(err, data) {
    let id = JSON.parse(data).sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.id;
    if(!id) throw "Could not upload file";
});


