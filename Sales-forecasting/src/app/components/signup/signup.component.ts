import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  user = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };

  onSubmit() {
    this.apiService.signup(this.user).subscribe(
      response => console.log(response),
      error => console.log(error)
    );
  }
  public signupForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router,private apiService: ApiService, ) {}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      firstName:['', Validators.required],
      lastName:['', Validators.required],
      email:['', Validators.required],
      password:['', Validators.required],
    })
  }

  type: string="password";
  isText: boolean= false;
  eyeIcon: string="fa-eye-slash";

  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  signUp(): void {
    this.http.post<any>('http://127.0.0.1:5000/signup', this.user)
      .subscribe(
        (res) => {
          alert('Signup Successful');
          this.user = {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
          };
          this.signupForm.reset(); // Reset the form
          this.router.navigate(['login']); // Navigate to the login page
        },
        (err) => {
          alert('Something went wrong!!!');
          console.error(err);
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
