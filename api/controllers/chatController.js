import { GoogleGenerativeAI } from "@google/generative-ai";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";

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
