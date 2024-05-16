import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
  outputs:['childEvent']
})
export class AssistantComponent {
  childEvent = new EventEmitter();

  @Output() formDataEvent = new EventEmitter<any>();

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Emit the form data to the parent component
      this.formDataEvent.emit(form.value);
    }
  }
  
}
