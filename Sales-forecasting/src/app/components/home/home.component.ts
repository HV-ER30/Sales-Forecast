import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  selectedFile: File | null = null;
  selectedMode: string = 'linearRegression';
  showGraph: boolean = false;
  showInsights: boolean = false;
  predictionAccuracy: string = '';
  importantFeatures: string[] = [];


  constructor(private http: HttpClient) {}

  handleFileInput(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.selectedFile as Blob);

    this.http.post('http://127.0.0.1:5000/upload', formData).subscribe(
      response => {
        alert('File uploaded successfully.');
      },
      error => {
        alert('File uploaded successfully');
      }
    );
  }

}


