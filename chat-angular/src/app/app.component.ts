import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from './websocket/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chat-angular';

  messageSubscription!: Subscription;

  nameForm!: FormGroup;
  chatForm!: FormGroup;
  hideForm: boolean = false;
  username!: string;
  messages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private socketService: WebsocketService
  ) {
    this.nameForm = this.fb.group({
      username: ['', Validators.required],
    });

    this.chatForm = this.fb.group({
      content: ['', Validators.required],
    });

    this.messageSubscription = this.socketService.messageSubject.subscribe(
      (payload) => {
        this.handleMessage(payload);
      }
    );
  }

  enterChat(event: any) {
    event.preventDefault();

    this.username = this.nameForm.get('username')?.value.trim();
    this.socketService.onConnected(this.username);
  }

  handleMessage(payload: any) {
    this.messages.push(JSON.parse(payload.body));
    this.hideForm = true;
    console.log(this.messages);
  }

  getAvatarColor(messageSender: string) {
    let colors = [
      '#2196F3',
      '#32c787',
      '#00BCD4',
      '#ff5652',
      '#ffc107',
      '#ff85af',
      '#FF9800',
      '#39bbb0',
    ];
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
  }

  getMessageClass(message: any) {
    return message.type === 'JOIN' || message.type === 'LEAVE'
      ? 'event-message'
      : 'chat-message';
  }

  sendMessage() {
    let message = this.chatForm.get('content')?.value;

    this.socketService.sendMessage(message, this.username);

    this.chatForm.reset();
  }

  leaveChat() {
    this.socketService.onDisconnected();
  }
}
