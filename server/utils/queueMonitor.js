const executionQueue = require("../queue");

const getQueueStats = async () => {

    const counts = await executionQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed"
  );

  const isOverloaded = counts.waiting >= 5;

  return {
    status: isOverloaded ? "overloaded" : "healthy",
    counts,
  };
};

module.exports = { getQueueStats };