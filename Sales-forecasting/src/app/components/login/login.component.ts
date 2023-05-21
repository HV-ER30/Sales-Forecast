import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  type: string="password";
  isText: boolean= false;
  eyeIcon: string="fa-eye-slash";
  public loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router,private auth: AuthService ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['',Validators.required],
      password: ['',Validators.required]
    })
  }

  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  login() {
    const userData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.http.post<any>('http://127.0.0.1:5000/login', userData).subscribe(
      {
        next: (res) => {
          if (res.access_token) {
            this.auth.storeToken(res.token);
            localStorage.setItem('access_token', res.access_token);
            alert('Login Successful');
            this.router.navigate(['home']);
          } else {
            alert('Invalid credentials');
          }
        },
        error: (err) => {
          alert('Invalid credentials');
        }
      }
    );
  }

  private validateAllFormFields(formGroup:FormGroup){
    Object.keys(formGroup.controls).forEach(field=>{
      const control = formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true});
      }
      else if(control instanceof FormGroup){
        this.validateAllFormFields(control)
      }
    })
  }
  
}
