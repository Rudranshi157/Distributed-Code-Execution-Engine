const executeJava = require("./executors/executeJava");
const executeCpp = require("./executors/executeCpp");
const executeJavaScript = require("./executors/executeJavaScript");
const executePython = require("./executors/executePython");

const executors = {
    java: executeJava,
    python: executePython,
    js: executeJavaScript,
    cpp: executeCpp,
};  

const execute = async(language, code, input) => {

    const executor = executors[language];
    if(!executor){
        throw new Error("Unsupported language");
    }

    return executor(code, input);
}

module.exports = execute;