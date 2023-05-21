import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated():boolean{
    if(sessionStorage.getItem('token')!==null){
      return true;
    }
    
      return false;
      }

  login(value: any) {
    throw new Error('Method not implemented.');
  }

  private baseUrl:string = "http://127.0.0.1:5000";
  private userPayload:any;
  constructor(private http : HttpClient, private router: Router) {
    
   }

  signUp(userObj:any){
    return this.http.post<any>(`${this.baseUrl}signup`,userObj)
  }

  signIn(loginObj:any){
    return this.http.post<any>(`${this.baseUrl}login`,loginObj)
  }

  signOut(){
    localStorage.clear();
    this.router.navigate(['login'])
  }

  storeToken(tokenValue: string){
    localStorage.setItem('token',tokenValue)
  }

  getToken(){
    return localStorage.getItem('token')
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem('token')
  }
  
  canAcces(){
    if(!this.isAuthenticated()){
      this.router.navigate(['/login']);
    }
  }
  canAuthenticate(){
    if(this.isAuthenticated()){
      this.router.navigate(['/dashboard']);
  }
  }   

   removeToken(){
  sessionStorage.removeItem('token');
}
}
