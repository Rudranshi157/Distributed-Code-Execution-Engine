
const API_URL = "http://localhost:3000"; 
export const executeCode = async (language, code, input, clientId) => {
     console.log("Sending to backend:", {
        language,
        code,
        input,
        clientId
    });

    const response = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        language,
        code,
        input,
        clientId,
        }),
    });

    const data = await response.json();

    return data.jobId;
};





