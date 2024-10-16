import {Component,OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userName: string | null = '';
  isLogged: boolean = false;


  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private router: Router) {

  }

  ngOnInit(): void {
    this.authService.getIsLogged()
      .subscribe((isLoggedIn: boolean): void => {
        this.isLogged = isLoggedIn;
        if (isLoggedIn) {
          this.authService.getUserInfo()
            .subscribe((userName: string | null): void => {
              this.userName = userName;
            });
        } else {
          this.userName = null;
        }
      });
  }


  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (): void => {
          this.doLogout();
        },
        error: (): void => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this.router.navigate(['/']);
  }


  //Проверка активного состояния для ссылки на /blog, чтобы ссылка была активной при любом действии на странице /blog
  isActive(): boolean {
    const urlWithoutQueryParams:string = this.router.url.split('?')[0];
    return urlWithoutQueryParams === '/blog';
  }

}
