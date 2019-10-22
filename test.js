require("./trelloUsers.json");
require("./auth.json");

require("./googlefileupload.js")(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"), require("./auth.json").googleCookie, "test_pixel.png", function(err, data) {
    let id = JSON.parse(data).sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.id;
    if(!id) throw "Could not upload file";
});

require("./googleformssubmit.js")("1FAIpQLSf5qv5oSVkXodWN8AHOIZdvRtMOk3Zwo-4GUGvKEQBjcKMDkg", {
        "entry.32757599": "e",
        "entry.1720335837": "rere",
        "entry.997188700": "fedf",
        "entry.894449259": process.argv[2],
        "entry.1241821788_month": "01",
        "entry.1241821788_day": "01",
        "entry.1241821788_year": "2019",
    }, require("./auth.json").googleCookie, function(err, res, bod) {
        if(err) throw "Could not submit form";
    });
