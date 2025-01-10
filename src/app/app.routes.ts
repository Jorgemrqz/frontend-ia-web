import { Routes } from '@angular/router';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { HistorialComponent } from './components/historial/historial.component';

export const routes: Routes = [
    { path: 'prediccion', component: ImageUploadComponent },
    { path: 'historial', component: HistorialComponent },
    { path: '', redirectTo: '/prediccion', pathMatch: 'full' },
];
