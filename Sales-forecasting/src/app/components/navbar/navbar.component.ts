import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(public auth:AuthService){}

  ngOnInit(): void{
    
  }
  logout(){
    this.auth.removeToken();
    this.auth.canAcces();
  }
}
