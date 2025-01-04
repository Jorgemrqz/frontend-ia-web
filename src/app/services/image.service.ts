import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://127.0.0.1:8000/predict/'; // URL del backend

  constructor(private http: HttpClient) { }

  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post(this.apiUrl, formData);
  }
}
