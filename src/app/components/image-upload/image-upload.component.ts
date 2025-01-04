import { Component } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  predictions: string[] = [];

  constructor(private imageService: ImageService) {}
  
// Método para manejar la selección de imágenes
onImageSelected(event: any): void {
  if (event.target.files && event.target.files[0]) {
    this.selectedImage = event.target.files[0];

    // Generar la vista previa
    if (this.selectedImage) { // Asegurarse de que no sea null
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; // Almacena la imagen en formato base64
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }
}

// Método para subir la imagen y obtener predicciones
onUpload(): void {
  if (this.selectedImage) {
    this.imageService.uploadImage(this.selectedImage).subscribe(
      (response) => {
        this.predictions = response.predictions;
        this.speakPredictions();
      },
      (error) => {
        console.error('Error uploading image:', error);
      }
    );
  } else {
    alert('Por favor, selecciona una imagen.');
  }
}

// Método para generar voz con las predicciones
speakPredictions(): void {
  const text = `Hay ${this.predictions.join(' y ')}`;
  const speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
}

}
