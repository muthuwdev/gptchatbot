import  { GoogleGenerativeAI } from '@google/generative-ai';
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({path:"config/config.env"});

// const genAi = new GoogleGenerativeAI(process.env.API_KEY);
// async function sendMessage(message){
//     const model = await genAi.getGenerativeModel({model:"gemini-pro"});
//     const data = await model.generateContent(message);
//     return data;
// }

// app.post('', (request, response)=>{
//     let message = request.body.message;
//     sendMessage(message).then(data=>{
//         response.send({user:'server', message:data.response.text()});
//     });
//     console.log('hello');

// });

app.listen(4000,()=>{
    console.log('App is running');
});

