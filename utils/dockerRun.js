const run = require("./run");
const crypto = require("node:crypto");
const { execFile } = require("node:child_process");

const dockerRun = async ({
    image, 
    mountDir,
    workDir,
    command,
    input,
    timeout = 5000,

}) => {

    const containerName = `code-runner-${crypto.randomUUID()}`;

    const stopContainer = () => {
        execFile("docker", ["kill", containerName], (error) => {
            if (error) {
                console.error("Failed to stop container:", error.message);
            }
        });
    };

    return run(
        "docker",
        [
            "run",
            "--name",
            containerName,

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
        timeout,
        stopContainer
    );
}

module.exports = dockerRun;