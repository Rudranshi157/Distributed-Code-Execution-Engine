function SubmissionFilters({
    languageFilter,
    setLanguageFilter,
    statusFilter,
    setStatusFilter
}) {
    return (
        <div className="submission-filters">

            {/* Language Filter */}
            <div>
                <label htmlFor="languageFilter">
                    Language:
                </label>

                <select
                    id="languageFilter"
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="js">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                </select>
            </div>

            {/* Status Filter */}
            <div>
                <label htmlFor="statusFilter">
                    Status:
                </label>

                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="queued">Queued</option>
                    <option value="running">Running</option>
                    <option value="tle">Time Limit Exceeded</option>
                </select>
            </div>

        </div>
    );
}

export default SubmissionFilters;