const express = require("express");
const execute = require("./execute");
const app = express();
const formatResult = require("./utils/formatResult");

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Remote Code Runner API");
});

app.post("/execute", async (req, res) => {
       console.log(req.body);
    const {language, code, input} = req.body;

    if(!language) {
        return res.status(400).json({
            success: false,
            error: "Language is required"
        });
    }
    if(!code) {
        return res.status(400).json({
            success: false,
            error: "Code is required"
        });
    }

    try {
        const output = await execute(language, code, input);

        return res.json(output);

    }catch (err) {
        if (err.code === "TLE") {
            return res.status(408).json(
                formatResult({
                    status: "Time Limit Exceeded",
                    executionTime: err.executionTime,
                })
            );
        }

        if (err.code === "OLE") {
            return res.status(413).json(
                formatResult({
                    status: "Output Limit Exceeded",
                    executionTime: err.executionTime,
                })
            );
        }

        if(err.message === "Unsupported language"){
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
        return res.status(500).json({
            success: false,
            error: err.message,
        });
        
    }

});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});