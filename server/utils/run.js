
const { spawn } = require('node:child_process');

const MAX_OUTPUT_SIZE = 1024 * 1024; // 1 MB

const run = (
    command,
    args,
    options = {},
    input = "",
    timeout = 2000,
    onTimeout = null
) => {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, options);
        
        let output ="" ;
        let stderr = "";
        let timedOut = false;
        let outputSize = 0;
        let outputLimitExceeded = false;

        const timer = setTimeout(() => {
            timedOut = true;
            if(onTimeout){
                onTimeout();
            }

            child.kill("SIGTERM");
            
            setTimeout(() => {
                if (!child.killed)
                    child.kill("SIGKILL");
            }, 100);

        }, timeout);

        const cleanup = () => {
            clearTimeout(timer);
        }

  
        const handleOutput = (data, stream) => {

            if (outputLimitExceeded) {
                return;
            }

            outputSize += data.length;

            if(!outputLimitExceeded && outputSize > MAX_OUTPUT_SIZE) {
                outputLimitExceeded = true;

                if (!child.killed) {
                    child.kill("SIGTERM");
                }

                setTimeout(() => {
                    if(!child.killed){
                        child.kill("SIGKILL");
                    }
                }, 100);

                return;
            }

            if(stream === "stdout"){
                output += data.toString();
            }else{
                stderr  += data.toString();
            }
        }

        child.stdout.on('data', (data) => handleOutput(data, "stdout"));

        if(child.stdin){
            
            child.stdin.end(input);
        }
        child.stderr.on('data', (data) => handleOutput(data, "stderr"));
        child.once('close', (code) => {
                cleanup();
                const executionTime = Date.now() - startTime;
                if(timedOut){
                    const error = new Error("Time Limit Exceeded");
                    error.code = "TLE";
                    error.timeout = timeout;
                    error.executionTime = executionTime;
                    return reject(error);
                }

                if(outputLimitExceeded){
                    const error = new Error("Output Limit Exceeded");
                    error.code = "OLE";
                    error.maxOutput = MAX_OUTPUT_SIZE;
                    error.executionTime = executionTime;
                    return reject(error);
                }

                return resolve({
                        
                    stdout: output,
                    stderr,
                    exitCode: code,
                    executionTime
                });
           
                
                
        });
        child.once('error', (err) => {
                cleanup();
                err.executionTime = Date.now() - startTime;
                reject(err);
    });
})};

module.exports = run;