import { GoogleGenerativeAI } from "@google/generative-ai";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";

export const modifyChatGptAssistantTools = async (req,res,next) => {
    // Best to receive enchripted open ai token and decript it to use in backend

    try {
        const OpenAiToken = req.body.openai;
        const openAiAssistantId = req.body.assistantId;
    
        const retrieveAssitentUrl = `https://api.openai.com/v1/assistants/${openAiAssistantId}`;
        // retrieve assistant
        const assistantDataResponse = await fetch(retrieveAssitentUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OpenAiToken}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
            },
        });

        if (!assistantDataResponse.ok) {
            return next(createError(400,"Invalid Assistant Id"));
        }
        const assistantData = await assistantDataResponse.json();

        // create tool to get weather updates
        const weatherTool = [
            {
                "type": "function",
                "function": {
                    "name": "getWeatherData",
                    "description": "Provide a 14 day summary of weather for a given location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "city": {
                                "type": "string",
                                "description": "city that you want weather updates"
                            },
                            "country": {
                                "type": "string",
                                "description": "Country in which the city that you want weather updates, is located"
                            }
                        },
                        "required": ["city","country"]
                    }
                }
            }
        ];
        let  retrievedAssistantTools =assistantData.tools;
        retrievedAssistantTools.push(weatherTool);

        // Update Assitant with tool
        const modifyUrlPostData = {
            tools: retrievedAssistantTools,
        }
        const retrieveAssitantUrl = `https://api.openai.com/v1/assistants/${openAiAssistantId}`;
        const retrieveAssitantUrlResponse = await fetch(retrieveAssitantUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OpenAiToken}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(modifyUrlPostData)
        });
        if (!retrieveAssitantUrlResponse.ok) {
            return next(createError(400,"Bad request"));
        }

        return next(createSuccess(200,"Assistant updated with weather function"));
    } catch (error) {
        console.error('Error making API request:', error);
        return next(createError(500,"Internal Server Error"));
    }
};

async function getWeatherForcast(cityParam, countryParam ) {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = cityParam;
    const country = countryParam;
    const apiUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&country=${country}&days=14&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('14-Day Weather Forecast:', data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

export const getMessageFromChatGpt = async(req,res,next)=>{
    try{
        const userMessage = req.body.message;
        const openAiAssistantId = req.body.assistantId;
        const OpenAiToken = req.body.openai;

         // Create thread and run
        const createThreadRunPostData = {
            assistant_id: openAiAssistantId,
            thread: {
                messages: [
                  {role: user, content: userMessage}
                ]
              }
        }
        const createThreadAndRunUrl = `https://api.openai.com/v1/threads/runs`;
        const createThreadAndRunResponse = await fetch(createThreadAndRunUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OpenAiToken}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createThreadRunPostData)
        });
        if (!createThreadAndRunResponse.ok) {
            return next(createError(400,"Create Thread and Run Failed"));
        }
        const threadAndRunData = await createThreadAndRunResponse.json();
        const openAiThereadId = threadAndRunData.thread_id;
        const runId = threadAndRunData.id;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let messageProcessing = {};
        while (messageProcessing.status === 'pending') {
            await delay(5000); // Wait for 5 seconds
            messageProcessing = await checkStatusAndGetMessages(openAiToken, openAiThereadId, runId);
            
        }

        if(messageProcessing.status === 'success'){
            return next(createSuccess(200,"Message from Server",{user:'server', message:messageProcessing.message}));
        }else if(messageProcessing.status === 'failed'){
            return next(createError(400,messageProcessing.message));
        }

    }catch(error){
        return next(createError(500,"Internal Server Error"));
    }
};

const checkStatusAndGetMessages = async (openAiToken, threadId, runId) => {
    // retrieve run
    let weatherOutput = '';
    const retrieveRunUrl = `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`;
    const retrieveRunUrlResponse = await fetch(retrieveRunUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${openAiToken}`,
            'OpenAI-Beta': 'assistants=v2',
            'Content-Type': 'application/json'
        }
    });
    if (!retrieveRunUrlResponse.ok) {
        // return next(createError(400,"Retrieve Run Failed"));
        return {status:'failed',message:"Retrieve Thread Run Failed" };
    }

    let runData = await response.json();
    let runStatus =  runData.status;
   
    if(runStatus === "completed"){
                // Submit the tool outputs to Assistant API
                const listMessagesRunUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;
                const listMessagesResponse = await fetch(listMessagesRunUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${openAiToken}`,
                        'OpenAI-Beta': 'assistants=v2',
                        'Content-Type': 'application/json'
                    }
                });
                if (!listMessagesResponse.ok) {
                    return {status:'failed',message:"List Messages Failed"};
                }
                let listMessagesData = await listMessagesResponse.json();
                const gptMessagesLength = listMessagesData.data[0].length;
                const gptMessage = listMessagesData.data[gptMessagesLength-1].content[0].text.value;
                return {status:'success',message:gptMessage };

    } else if (runStatus.status === 'requires_action') {
    
        const requiredActions = runStatus.required_action.submit_tool_outputs.tool_calls;
    
        let toolsOutput = [];
    
        for (const action of requiredActions) {
            const funcName = action.function.name;
            const functionArguments = JSON.parse(action.function.arguments);
            
            if (funcName === "getWeatherData") {
                weatherOutput = await getWeatherForcast(functionArguments.city, functionArguments.country);
                toolsOutput.push({
                    tool_call_id: action.id,
                    output: JSON.stringify(weatherOutput)  
                });
            } else {
                return {status:'failed',message:"getWeatherData function not found in assistant" };
            }

        // Submit the tool outputs to Assistant API
        const submitToolOutputsRunUrl = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`;
        const submitToolOutputsRunResponse = await fetch(submitToolOutputsRunUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiToken}`,
                'OpenAI-Beta': 'assistants=v1',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                tool_call_id:toolsOutput[0].tool_call_id,
                output:toolsOutput[0].output
            })
        });
        if (!submitToolOutputsRunResponse.ok) {
            return {status:'failed',message:"Submit Weather Tool Output Failed" };
        }
        return {status:'pending',message:"function output submitted to chatgpt" };
        }
        return {status:'pending',message:"Pending in proceeding function" };
    } 
    else {
        return {status:'pending',message:"Pending data from chatgpt" };
    }  
};

const genAi = new GoogleGenerativeAI(process.env.API_KEY);
async function sendMessage(message){
    const model = await genAi.getGenerativeModel({model:"gemini-pro"});
    const data = await model.generateContent(message);
    return data;
}
export const getMessage = async(req,res,next)=>{
    try{
        let message = req.body.message;
        return next(createSuccess(200,"Message from Server",{user:'server', message:message}));

    }catch(error){
        return next(createError(500,"Internal Server Error"));
    }
};
