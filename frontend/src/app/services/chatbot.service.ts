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

}
