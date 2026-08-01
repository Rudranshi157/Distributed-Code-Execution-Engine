const run = require("./run");

const dockerRun = async ({
    image, 
    mountDir,
    workDir,
    command,
    input,
    timeout = 5000,

}) => {
    
    return run(
        "docker",
        [
            "run",
            "--rm",
            "-i",

            "--cpus",
            "1",

            "--memory",
            "128m",

            "--pids-limit",
            "64",

            "--network",
            "none",
            
            "--read-only",
            "--tmpfs" ,
            "/tmp",
           
            "-v",
            `${mountDir}:${workDir}`,

            "-w",
            workDir,
            
            image,
            ...command,
        ],
        {},
        input,
        timeout
    );
}

module.exports = dockerRun;