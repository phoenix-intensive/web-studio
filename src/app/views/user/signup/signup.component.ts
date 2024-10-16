import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {LoginResponseType} from "../../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  password: string = '';
  showPassword: boolean = false;


  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[А-ЯЁ][а-яё]*(\s[А-ЯЁ][а-яё]*)*$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    agree: [false, Validators.requiredTrue]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  signup(): void {
    if (this.signupForm.valid && this.signupForm.value.name && this.signupForm.value.email && this.signupForm.value.password) {
      this.authService.signup(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType): void => {

            const signupResponse: LoginResponseType = data as LoginResponseType;

            if (!signupResponse.accessToken || !signupResponse.refreshToken || !signupResponse.userId) {
              this._snackBar.open('Ошибка при авторизации');
              return;
            }

            this.authService.setTokens(signupResponse.accessToken, signupResponse.refreshToken);
            this.authService.userId = signupResponse.userId;
            this.authService.setUserInfo({name: this.signupForm.value.name as string});


            this._snackBar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse): void => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка при авторизации');
            }
          }
        });
    }
  }



  //Методы по скрытию и открытию пароля
  get passwordFieldType(): string {
    return this.showPassword ? 'text' : 'password';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
