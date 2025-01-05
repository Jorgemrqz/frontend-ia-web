import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageUploadComponent } from "./components/image-upload/image-upload.component";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImageUploadComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-ia-web';
}
