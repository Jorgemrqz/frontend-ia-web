import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent implements OnInit {
  historial: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://35.238.9.234:8000/historial/').subscribe((data: any) => {
      this.historial = data;
      this.isLoading = false;
    });
  }
}
