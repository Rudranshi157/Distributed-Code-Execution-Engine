
const API_URL = "http://localhost:3000"; 
export const executeCode = async (language, code, input) => {
const response = await fetch(`${API_URL}/execute`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({
    language,
    code,
    input,
    }),
});

const data = await response.json();

return data.jobId;
};


export const pollResult = async (jobId) => {
while (true) {
    const response = await fetch(`${API_URL}/result/${jobId}`);
    const result = await response.json();

    if (
    result.state === "completed" ||
    result.state === "failed"
    ) {
    return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
}
};




