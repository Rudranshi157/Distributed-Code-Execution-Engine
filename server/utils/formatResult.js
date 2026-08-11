const formatResult = ({
    status,
    stdout = "",
    stderr = "",
    exitCode = null,
    executionTime = null
}) => {
    return {
        success: status === "Accepted",
        status,
        stdout,
        stderr,
        exitCode,
        executionTime
    };
};

module.exports = formatResult;