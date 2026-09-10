const TestCase = require("../models/TestCase");
const execute = require("../execute");

const normalizeOutput = (output) => {
    return output.trim().replace(/\r\n/g, "\n");
};
const judge = async ({problemId, language, code}) => {
    const publicTestResults = [];

   
    let testCases = await TestCase
        .find({problemId})
        .sort({order: 1});
    // console.log("Found test cases:", testCases.length);

    if (testCases.length === 0) {
        throw new Error("No test cases found for this problem");
    }


    // console.log(
    //     testCases.map(test => ({
    //         isHidden: test.isHidden,
    //         order: test.order
    //     }))
    // );
    
    let testPassed = 0;
    const hiddenTestCount = testCases.filter(
        (test) => test.isHidden
    ).length;

    let hiddenPassed = 0;

    let finalVerdict = null;
    
    for(let i = 0; i < testCases.length; i++){

        let test = testCases[i];
        
        let input = test.input;
        
        let result;
        let status = "Wrong Answer";

        try {
            result = await execute(language, code, input);

            if (result.success) {
                const actualNormalized = normalizeOutput(result.stdout);
                const expectedNormalized = normalizeOutput(test.expectedOutput);

                if (actualNormalized === expectedNormalized) {
                    testPassed++;
                    status = "Passed";
                } else {
                    status = "Wrong Answer";
                }
            } else {
            
                status = result.status;
            }

        } catch (err) {

            if (err.code === "TLE") {
               
                status = "Time Limit Exceeded";
                result = {
                    executionTime: err.executionTime || 0
                };
            }

            else if (err.code === "OLE") {
            
                status = "Output Limit Exceeded";
                result = {
                    executionTime: err.executionTime || 0
                };
            }

            else {
                
                status = "Runtime Error";
                result = {
                    executionTime: err.executionTime || 0
                };
            }
        }
        
        if(test.isHidden){

            if(status === "Passed"){
                hiddenPassed++;
            }
        }else{
            publicTestResults.push({
                test: i+1,
                status,
                executionTime: result.executionTime || 0
            });
        }

        if (
            status === "Compilation Error" ||
            status === "Time Limit Exceeded" ||
            status === "Output Limit Exceeded" ||
            status === "Runtime Error" 
        ) {

            finalVerdict = status;

            break;
        }
        
    }
    if (!finalVerdict) {
        finalVerdict =
        testPassed === testCases.length
            ? "Accepted"
            : "Wrong Answer";
    }
    // console.log(
    //     `${testPassed} / ${testCases.length}`
    // );
   
    return {
        verdict: finalVerdict,
        passedTests: testPassed,
        totalTests: testCases.length,
        publicTestResults,
        hiddenTests: {
            passed: hiddenPassed,
            total: hiddenTestCount
        }
    };

};

module.exports = judge;