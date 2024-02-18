import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  messageSubject: Subject<any> = new Subject<any>();

  webSocketEndPoint: string = 'http://localhost:8080/ws';
  topic: string = '/topic/public';
  stompClient: any;

  constructor() {}

  onConnected(name: string) {

    console.log('Initialize WebSocket Connection');
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(this.topic, (payload: any) => {
        this.onMessageRecieved(payload);
      });

      this.stompClient.send(
        '/app/chat.addUser',
        {},
        JSON.stringify({
          sender: name,
          type: 'JOIN',
        })
      );
    });
  }

  onDisconnected() {
    this.stompClient.disconnect();
  }

  onMessageRecieved(payload: any) {
    this.messageSubject.next(payload);
  }

  sendMessage(content: string, name: string) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(
        '/app/chat.sendMessage',
        {},
        JSON.stringify({
          sender: name,
          content: content,
          type: 'CHAT',
        })
      );
    } else {
      console.error('WebSocket connection is not established.');
    }
  }
}
