
const API_URL = "http://localhost:3000"; 
export const executeCode = async (language, code, input, clientId) => {
     console.log("Sending to backend:", {
        language,
        code,
        input,
        clientId
    });

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
        language,
        code,
        input,
        clientId,
        }),
    });

    const data = await response.json();

     if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to execute code");
    }

    return data.jobId;
};

export const submitCode = async (problemId, language, code, clientId) => {
    console.log("Submitting code:", {
        problemId,
        language,
        code,
        clientId
    });

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            problemId,
            language,
            code,
            clientId
        }),
    });

    const data = await response.json();
    
    if(!response.ok){
        throw new Error(data.error || data.message || "Failed to submit code");
    }
    return data;
};




