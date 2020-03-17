import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  title = 'flightbooking';
  array = [1,2,3,4];

  maxValue = "1500"



  slider(e){
   this.maxValue = e.target.value
  }

  ngOnInit() {
    
  }


}
