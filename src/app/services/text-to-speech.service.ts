import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private apiUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  private apiKey = 'AIzaSyDCiXOnsP19DXlTh20imz1cABJFLQ09JWo';

  constructor(private http: HttpClient) {}

  synthesizeSpeech(text: string): Observable<any> { // Cambié el tipo a 'any'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      input: { text: text },
      voice: { languageCode: 'es-US', name: 'es-US-Wavenet-B' },
      audioConfig: { audioEncoding: 'MP3' }
    };

    return this.http.post<any>(`${this.apiUrl}?key=${this.apiKey}`, body, { headers });
  }
}
