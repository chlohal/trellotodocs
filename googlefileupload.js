var request = require("request");

module.exports = function(fileBuffer, cookie, fileName, callback) {
    request.post("https://docs.google.com/upload/resumableuploadsc?authuser=2",
        {body: `{"protocolVersion":"0.8","createSessionRequest":{"fields":[{"external":{"name":"file","filename":"${fileName}","put":{},"size":${fileBuffer.length}}},{"inlined":{"name":"title","content":"${fileName}","contentType":"text/plain"}},{"inlined":{"name":"addtime","content":"${Date.now()}","contentType":"text/plain"}},{"inlined":{"name":"protocol","content":"4","contentType":"text/plain"}}]}}`,
        headers: {
            "cookie": cookie
        }},
        function(err, res, bod) {
            if(err) return callback(err);
            let parsedBody = JSON.parse(res.body);
            request.post(parsedBody.sessionStatus.externalFieldTransfers[0].putInfo.cross_domain_url,
            {body: fileBuffer,
            headers: {
                "cookie": cookie
            }
            }, function(err, res, bod) {
                if(err) return callback(err);

                let parsedBod = JSON.parse(bod);
               callback(err,bod);
               /* let fileId = parsedBod.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.id;
                request.post("https:\/\/docs.google.com/picker/pick?hl=en_US&xtoken=" + "&origin=https%3A%2F%2Fdocs.google.com&hostId=file-upload",
                {
                    form: {
                        docs: JSON.stringify([{
                            description: "",
                            docIndex: -1,
                            downloadUrl: JSON.parse(parsedBod.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo || "")[0].downloadUrl,
                            iconUrl: "https:\/\/ssl.gstatic.com/docs/doclist/images/icon_10_generic_list.png",
                            id: fileId,
                            isNew: true,
                            lastEdited: jsonData.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.lastEditedUtc;
                            lastEditedUtc: jsonData.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.lastEditedUtc;
                            mimeType: "image/png",
                            name: fileName,
                            serviceId: "docs",
                            thumbnails: [
                                {
                                    url:
                                    width: 32,
                                    height: 32
                                },
                                {
                                    url:
                                    width: 64,
                                    height: 64
                                },
                                {
                                    url:
                                    width: 72,
                                    height: 72
                                },
                                {
                                    url:
                                    width: 16,
                                    height: 16
                                }
                            ],
                            type: "photo",
                            uploadId: "0",
                            uploadState: "success",
                            url: jsonData.sessionStatus.additionalInfo["uploader_service.GoogleRupioAdditionalInfo"].completionInfo.customerSpecificInfo.actions.find(x=>x.actionCategory=="open").url;
                       }]),
                    viewToken: JSON.stringify(["upload",null,{"mimeTypes":"application/pdf,image/jpeg,image/gif,image/png,image/tiff,image/bmp","query":"docs","viewTokenDepth":0}]),
                    psdms: 10652,
                    token:
                    version: 4,
                    app: 2,
                    clientUser: 09653275328437170738,
                    subapp: 5,
                    authuser: require(__dirname + "/auth.json").googleAuthUser
                }, function(err, res, bod_) {
                    if(err) return callback(err);
                    else callback(err,bod);
                });*/
            });
    });
}

