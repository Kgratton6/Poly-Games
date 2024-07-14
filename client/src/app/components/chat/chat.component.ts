import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Text } from '@app/interfaces/text';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @Input() chats: Text[];
    @Input() yourUsername: string;
    @Output() messageSent = new EventEmitter<Text>();
    messageForm = new FormGroup({
        message: new FormControl(''),
    });
    sendIcon = faPaperPlane;

    sendMessage() {
        const messageContent = this.messageForm.value.message;
        if (messageContent && messageContent.trim()) {
            const newMessage: Text = {
                sender: this.yourUsername,
                message: this.messageForm.value.message,
            };
            this.chats.push(newMessage);
            this.messageSent.emit(newMessage);
            this.messageForm.reset();
        }
    }
}
