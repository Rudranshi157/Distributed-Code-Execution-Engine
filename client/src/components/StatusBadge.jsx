function StatusBadge({ status }) {
    const statusMap = {
        completed: {
            label: "Completed",
            className: "status-completed"
        },

        failed: {
            label: "Failed",
            className: "status-failed"
        },

        queued: {
            label: "Queued",
            className: "status-queued"
        },

        active: {
            label: "Running",
            className: "status-running"
        },

        running: {
            label: "Running",
            className: "status-running"
        },

        "Time Limit Exceeded": {
            label: "Time Limit Exceeded",
            className: "status-tle"
        },

        tle: {
            label: "Time Limit Exceeded",
            className: "status-tle"
        }
    };

    const currentStatus = statusMap[status] || {
        label: status,
        className: "status-unknown"
    };

    return (
        <span className={`status-badge ${currentStatus.className}`}>
            {currentStatus.label}
        </span>
    );
}

export default StatusBadge;