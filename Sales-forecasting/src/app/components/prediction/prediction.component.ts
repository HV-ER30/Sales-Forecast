import { Component , OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})

export class PredictionComponent {
  public labelss: string[] = [];
  public datas: number[] = [];
  public chartData: any = [];

  R2:any=[];

  constructor(private route: ActivatedRoute) { }
  isLineChartVisible = true;

  toggleChart(): void {
    this.isLineChartVisible = !this.isLineChartVisible;
  }
  
  chartdata = {
    labels: this.labelss,
    datasets: [{
      label: 'Sales Prediction',
      data: this.datas,
      fill: false,
      borderColor: 'rgb(0, 0, 0)',
      tension: 0.1,
     
    }]
  };

  ngOnInit(): void {
    this.chartData=this.chartData.slice(2)
    this.chartData.map((row: any) => {
 
  if (row.length > 1) {
    this.labelss.push(row[0] as string); 
    this.datas.push(Number(row[1]) as number);  
  }
  this.R2=history.state.R2;
});
    console.log('Chart Data:', this.chartData);
  }
}
