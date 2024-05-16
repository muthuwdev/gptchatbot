import express from "express";
const app = express();
import chatRoute from "./routes/chatRoute.js";
import cors from 'cors';

app.use(express.json());
app.use(cors({
    origin:'http://localhost:4200',
    credentials:true
}));

app.use("/api/chat", chatRoute);

//Response Handler Middleware

app.use((obj, req, res, next)=>{
    const statusCode = obj.status || 500;
    const message = obj.message || "Something went wrong";
    return res.status(statusCode).json({
        success:[200,201,204].some(a=>a===obj.status)? true :false,
        status:statusCode,
        message:message,
        data:obj.data
    });
});


export default app;
