import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, switchMap, tap} from "rxjs";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {environment} from "../../../environments/environment";
import {UserInfoType} from "../../../../types/user-info.type";
import {UserService} from "../../shared/services/user.service";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public accessTokenKey: string = 'accessToken';
  private refreshTokenKey: string = 'refreshToken';
  private userIdKey: string = 'userId';


  private isLogged: boolean = false;
  private userInfo$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private isLogged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private userService: UserService) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const accessToken: string | null = localStorage.getItem('accessToken');
    const userName: string | null = localStorage.getItem('name'); // Получаем имя пользователя из localStorage

    if (accessToken && userName) {
      // Если токен и имя есть, восстанавливаем состояние
      this.isLogged$.next(true);
      this.userInfo$.next(userName); // Восстанавливаем поток userInfo$
    } else {
      // Если нет токена, считаем пользователя разлогиненым
      this.isLogged$.next(false);
      this.userInfo$.next(null); // Сбрасываем имя пользователя
    }
  }


  getIsLogged(): Observable<boolean> {
    return this.isLogged$.asObservable();
  }

  public getLoggedIn(): boolean {
    return this.isLogged;
  }

  login(email: string, password: string, rememberMe: boolean): Observable<LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email,
      password,
      rememberMe
    })
      .pipe(
      switchMap((response: DefaultResponseType | LoginResponseType) => {
        const loginResponse: LoginResponseType = response as LoginResponseType;

        if (loginResponse.accessToken && loginResponse.refreshToken) {
          // Сохраняем токены в localStorage
          this.setTokens(loginResponse.accessToken, loginResponse.refreshToken);

          // Сохраняем userId в localStorage
          this.userId = loginResponse.userId;

          // Теперь делаем запрос на получение информации о пользователе и сохраняем в localStorage
          return this.userService.getUserInfo()
            .pipe(
              tap((userInfo: UserInfoType | DefaultResponseType): void => {
                // Сохраняем имя пользователя в localStorage
                this.setUserInfo(userInfo as UserInfoType);
              }),
              map(() => loginResponse) // Возвращаем исходный ответ для дальнейшей обработки
            );
        } else {
          // Если токены отсутствуют, бросаем ошибку
          throw new Error('Ошибка при авторизации');
        }
      })
    );
  }


  signup(name: string, email: string, password: string): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      name,
      email,
      password
    });
  }

  logout(): Observable<DefaultResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<DefaultResponseType>(environment.api + 'logout', {
      refreshToken
    });
  }


  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }


  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    }
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {refreshToken})
  }


  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('name');
    this.isLogged = false;
    this.isLogged$.next(false);
  }


  get userId(): null | string {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey)
    }
  }

  setUserInfo(userInfo: { name: string }): void {
    localStorage.setItem('name', userInfo.name);
    this.userInfo$.next(userInfo.name); // передаем имя в поток
  }

  getUserInfo(): Observable<string | null> {
    return this.userInfo$.asObservable();
  }

  getUserInfoName(): { name: string | null } {
    const name: string | null = localStorage.getItem('name');
    return {name};
  }
}
