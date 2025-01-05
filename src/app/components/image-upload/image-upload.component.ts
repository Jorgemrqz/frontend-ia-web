import { Component } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';
import { TextToSpeechService } from '../../services/text-to-speech.service';


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

  constructor(private imageService: ImageService,
    private textToSpeechService: TextToSpeechService) {}
  
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

  // Método para sintetizar las predicciones como voz
speakPredictions(): void {
  const introText = "Las etiquetas mostradas en la imágen son:";
  const predictionText = ` ${this.predictions.join(' y ')}`;
  const textToSpeak = introText + predictionText;

  this.textToSpeechService.synthesizeSpeech(textToSpeak).subscribe(
    (response: any) => {
      if (response.audioContent) {
        const audioBlob = new Blob([this.base64ToArrayBuffer(response.audioContent)], { type: 'audio/mpeg' });
        const audioUrl = window.URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.error('Error playing audio:', error));
      } else {
        console.error('Audio content is missing in the response.');
      }
    },
    (error) => {
      console.error('Error synthesizing speech:', error);
    }
  );
  
  
}
  // Función para convertir base64 a ArrayBuffer
  base64ToArrayBuffer(audioContent: string): BlobPart {
    const binaryString = window.atob(audioContent);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
  }


}
