var request = require("request");

var defaultRepo = "@nhs-t10/delta-v";
var treeRequestBody = {"operationName":null,"query":"fragment treeRecursive on Tree {\n  __typename\n  entries {\n    name\n    object {\n      ...treeEntry\n      ... on Tree {\n        entries {\n          name\n          object {\n            ...treeEntry\n            ... on Tree {\n              entries {\n                name\n                object {\n                  ...treeEntry\n                  ... on Tree {\n                    entries {\n                      name\n                      object {\n                        ...treeEntry\n                        ... on Tree {\n                          entries {\n                            name\n                            object {\n                              ...treeEntry\n                              ... on Tree {\n                                entries {\n                                  name\n                                  object {\n                                    ...treeEntry\n                                    ... on Tree {\n                                      entries {\n                                        name\n                                        object {\n                                          ...treeEntry\n                                          ... on Tree {\n                                            entries {\n                                              name\n                                              object {\n                                                ...treeEntry\n                                                ... on Tree {\n                                                  entries {\n                                                    name\n                                                    object {\n                                                      ...treeEntry\n                                                    }\n                                                  }\n                                                }\n                                              }\n                                            }\n                                          }\n                                        }\n                                      }\n                                    }\n                                  }\n                                }\n                              }\n                            }\n                          }\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment treeEntry on GitObject {\n  __typename\n  ... on Blob {\n    commitUrl\n  }\n}\n\n{\n  repository(owner: \"nhs-t10\", name: \"delta-v\") {\n    object(expression: \"master^{tree}\") {\n      ...treeRecursive\n    }\n  }\n}\n","variables":null};

module.exports = function(path, callback) {
    let paths = path.split(/;\s+/);

    let repo = parseFileRepo(paths[0]);

    request.post("https:\/\/api.github.com/graphql", {
        headers: {"User-Agent": "coleh2","Authorization": "bearer "+require("./auth.json").githubToken}
        json: treeRequestBody
    }, function(err, res, bod) {
        if(err) callback(err,null);
        let parsedTree = JSON.parse(bod);

        for(let i = 0; i < paths.length; i++) {
            parseFileSpec(paths[i], parsedTree);
        }
    });
};

let refTokenTypes = [
  {
    prefix: "@",
    desc: "Github user-- followed by repo name",
    selfish: 1,
    type: "github"
  },
  {
    prefix: "?"
    desc: "Partially known name",
    selfish: 0,
    type: "search"
  },
  {
    prefix: "*",
    desc: "Completely unknown name, known level",
    selfish: 0,
    type: "wildcard",
  },
  {
    prefix: "**",
    desc: "Multilevel wildcard",
    selfish: 0,
    type: "levels"
  {
    prefix: "",
    desc: "Normal",
    selfish: 0
];
function parseFileRepo(ref) {
    let tokenizedRef = ref.split("/");

    if(!tokenizedRef[0].startsWith("@")) return parseFileRepo(defaultRepo);

    return {
        owner: tokenizedRef[0].substring(1),
        repo: tokenizedRef[1]
    }
}
function parseFileSpecLevel(specToken, tree) {
    for(var i = 0; i < tree.
    if(specToken.type = "search")
}
function parseFileSpec(ref, tree) {
    let tokenizedRef = ref.split("/");

    let result = {
        githubRepo: "",
        filePath: "",
        fileName: "",
        commitUrl: ""
    }

    let tokenTypeArr = Object.keys(refTokenTypes);
    for(var i = 0; i < tokenizedRef.length; i++) {
        let currentToken = tokenizedRef[i];
        let tokenType = refTokenTypes.find(x=>tokenizedRef.startsWith(x.prefix));

        if(tokenType.type == "github") {
            result.githubRepo = currentToken + tokenizedRef[i+1];
        } else if(i == tokenizedRef.length - 1) {
            result.fileName = currentToken;
        }

        i += tokenType.selfish;
    }

    return result;
}
