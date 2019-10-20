var request = require("request");

module.exports = function(fileBuffer, cookie, fileName, callback) {
    request.post("https://docs.google.com/upload/resumableuploadsc?authuser=0", 
        {body: `{"protocolVersion":"0.8","createSessionRequest":{"fields":[{"external":{"name":"file","filename":"${fileName}","put":{},"size":${fileBuffer.length}}},{"inlined":{"name":"title","content":"${fileName}","contentType":"text/plain"}},{"inlined":{"name":"addtime","content":"${Date.now()}","contentType":"text/plain"}},{"inlined":{"name":"protocol","content":"4","contentType":"text/plain"}}]}}`,
        headers: {
            "cookie": cookie
        }},
        function(err, res, bod) {
            let parsedBody = JSON.parse(res.body);
            request.post(parsedBody.sessionStatus.externalFieldTransfers[0].putInfo.cross_domain_url,
            {body: fileBuffer,
            headers: {
                "cookie": cookie
            }
            }, function(err, res, bod) {
                callback(err,bod);
            });
    });
}

