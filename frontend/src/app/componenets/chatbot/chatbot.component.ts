import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { Message } from '../../interfaces/message';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantComponent } from '../assistant/assistant.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, AssistantComponent],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {

  public message:string='';
  public assistantData:any;
  public messages:Message[]=[];

  chatbotService=inject(ChatbotService);

  public sendMessage(){
    this.messages.push({
      user:'user',
      message:this.message
    })
    this.chatbotService.sendGoogleMessageService(this.message).subscribe((res:any)=>{
      this.messages.push(res.data);
      console.log('This is send message'+JSON.stringify(this.messages));
      this.message = ''
    });
  }

  public gptmessage(){
    this.messages.push({
      user:'user',
      message:this.message
    });
    const assistant_id = localStorage.getItem("assistant_id");
    const api_key = localStorage.getItem("api_key");
    this.chatbotService.gptmessage(api_key,assistant_id, this.message).subscribe((res:any)=>{
      this.messages.push(res.data);
      this.message = ''
    });
  }

  public getdata(val: any){
    this.assistantData = val;
  }

  onFormSubmit(formData: any) {
    // Handle the form data received from the child component
    console.log('Form Data in Parent:', formData);
    this.chatbotService.modifyAssistantTools(formData.apikey, formData.assistantId).subscribe((res:any)=>{
      if (res.status === 200) {
        localStorage.setItem("assistant_id",formData.assistantId);
        localStorage.setItem("api_key",formData.apikey);
      } 
    });
    
  }
}
