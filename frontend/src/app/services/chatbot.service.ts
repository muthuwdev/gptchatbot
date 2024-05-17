import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Environment } from '../environments/environment';
import { apiUrls } from '../api.urls';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  http = inject(HttpClient);
  constructor() { }
  
  // public sendMessage(message: string){
  //   return this.http.post(this.api_url,{message:message});
  // }

  sendGoogleMessageService(message:string){
    return this.http.post<any>(`${apiUrls.chatServiceApi}gmessage`,{message:message});
  }

  modifyAssistantTools(openai:string, assistantId:string){
    return this.http.post<any>(`${apiUrls.chatServiceApi}modifyAssitantTools`,{openai:openai, assistantId:assistantId});
  }

  gptmessage(openai:string| null, assistantId:string| null, message:string){
    return this.http.post<any>(`${apiUrls.chatServiceApi}gptmessage`,{openai:openai, assistantId:assistantId, message:message});
  }

}
