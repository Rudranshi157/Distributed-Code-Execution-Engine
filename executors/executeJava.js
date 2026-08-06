const fs = require('node:fs/promises');
const path = require("node:path");
const dockerRun = require("../utils/dockerRun");
const formatResult = require("../utils/formatResult");

const executeJava = async (code, input) => {

    let dir;

    try{
        await fs.mkdir("temp", { recursive: true });
        const prefix = path.join("temp", "run-");
        dir = await fs.mkdtemp(prefix);   
        const file = path.join(dir, "Main.java");
        // console.log("Directory:", dir);
        // console.log("File: ", file);     
        await fs.writeFile(file, code, {
            encoding: "utf8",
        });
        const absoluteDir = path.resolve(dir);
       
        const compileResult = await dockerRun({
            image: "code-runner-java",
            mountDir: absoluteDir,
            workDir: "/app",
            command: [
                "javac",
                "Main.java"
            ],
            input: "",
        });

        if(compileResult.exitCode !== 0){
            return formatResult({
                status: "Compilation Error",
                ...compileResult,
            });
        }

        const runResult = await dockerRun({
            image: "code-runner-java",
            mountDir: absoluteDir,
            workDir: "/app",
            command: [
                "java",
                "Main"
            ],
            input,
        })

        
        return formatResult({
            status: runResult.exitCode === 0 ? "Accepted" : "Runtime Error",
            ...runResult,
        });

        /*To achieve that, the error must travel upward to the 
        part of your application responsible for building the API 
        response. If you return err, you're turning the failure 
        into an ordinary return value, making it harder for the 
        caller to distinguish success from failure.*/

    } finally{
    if(dir){
            await fs.rm(dir, {
                recursive: true,
                force: true,
            });
        }
    }


}

module.exports = executeJava;