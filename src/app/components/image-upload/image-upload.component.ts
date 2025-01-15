import { Component } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { HttpClient } from '@angular/common/http';

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
  videoElement: HTMLVideoElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;
  stream: MediaStream | null = null;

  // Definir el historial de imágenes
  historial: { url: string, prediccion: string, fecha_subida: string, hora_subida: string }[] = [];

  constructor(private imageService: ImageService,
    private textToSpeechService: TextToSpeechService, private http: HttpClient) {}

  ngAfterViewInit() {
    this.videoElement = document.getElementById('camera-stream') as HTMLVideoElement;
    this.canvasElement = document.getElementById('camera-canvas') as HTMLCanvasElement;
  }

  // Activar la cámara
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error al activar la cámara:', error);
    }
  }

  // Desactivar la cámara
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
    } else {
      alert('La cámara ya está desactivada.');
    }
  }

  // Capturar la imagen desde la cámara
  captureImage() {
    if (this.videoElement && this.canvasElement) {
      const context = this.canvasElement.getContext('2d');
      if (context) {
        // Limpiar el canvas antes de dibujar la nueva imagen
        context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // Establecer el tamaño del canvas según el tamaño del video
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;

        // Dibujar la imagen del video en el canvas
        context.drawImage(this.videoElement, 0, 0);

        // Obtener la imagen como base64 para la vista previa
        const imageData = this.canvasElement.toDataURL('image/png');

        // Actualizar la vista previa con la nueva imagen
        this.imagePreview = imageData;

        // Asegurarse de crear un nuevo archivo a partir de los datos de la imagen base64
        this.selectedImage = this.dataURLtoFile(imageData, 'captured-image-' + new Date().getTime() + '.png');
      }
    }
  }

  // Convertir base64 a archivo
  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Agregar la imagen al historial
  addToHistorial(image: string) {
    const newItem = {
      url: image,
      prediccion: 'Predicción de ejemplo', // Reemplaza con las predicciones reales si es necesario
      fecha_subida: new Date().toLocaleDateString(),
      hora_subida: new Date().toLocaleTimeString(),
    };
    this.historial.unshift(newItem); // Usamos unshift para agregar al principio
  }

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
      const formData = new FormData();
      formData.append('archivo', this.selectedImage, this.selectedImage.name);

      this.http.post<any>('http://35.238.9.234:8000/prediccion/', formData).subscribe(
        (response) => {
          this.predictions = response.predictions;
          this.addToHistorial(response.url);
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
  if (this.predictions.length === 0) {
    console.warn('No hay predicciones para sintetizar.');
    return;
  }

  const introText = "Las etiquetas mostradas en la imagen son:";
  
  // Construir el texto con conectores para una narración más natural
  let predictionText = "";
  this.predictions.forEach((prediction, index) => {
    if (index === 0) {
      predictionText += ` ${prediction}`;
    } else if (index === this.predictions.length - 1) {
      predictionText += `, y ${prediction}`;
    } else {
      predictionText += `, además de ${prediction}`;
    }
  });

  const textToSpeak = introText + predictionText;

  // Llamar al servicio de síntesis de voz
  this.textToSpeechService.synthesizeSpeech(textToSpeak).subscribe(
    (response: any) => {
      if (response.audioContent) {
        const audioBlob = new Blob([this.base64ToArrayBuffer(response.audioContent)], { type: 'audio/mpeg' });
        const audioUrl = window.URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.error('Error reproduciendo el audio:', error));
      } else {
        console.error('No se encontró contenido de audio en la respuesta.');
      }
    },
    (error) => {
      console.error('Error al sintetizar el habla:', error);
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
