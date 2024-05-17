import express from "express";
import {getMessage, getMessageFromChatGpt, modifyChatGptAssistantTools} from "../controllers/chatController.js";
const router = express.Router();

router.post("/gmessage", getMessage );
router.post("/gptmessage", getMessageFromChatGpt );
router.post("/modifyAssitantTools", modifyChatGptAssistantTools );


export default router;