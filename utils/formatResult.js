const formatResult = ({
    status,
    stdout = "",
    stderr = "",
    exitCode = null,
    executionTime = null
}) => {
    return {
        success: true,
        status,
        stdout,
        stderr,
        exitCode,
        executionTime
    };
};

module.exports = formatResult;