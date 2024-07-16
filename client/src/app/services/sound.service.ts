import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    playSound(name: string): void {
        const audio = new Audio(`./assets/audio/${name}.wav`);
        audio.play();
    }
}
