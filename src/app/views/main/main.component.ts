import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticlesService} from "../../shared/services/articles.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {FormBuilder, Validators} from "@angular/forms";
import {ServiceService} from "../../shared/services/service.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderType} from "../../../../types/order.type";
import {ServiceType} from "../../../../types/service.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {OrderService} from "../../shared/services/order.service";
import {ArticleType} from "../../../../types/articles-best.type";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})

export class MainComponent implements OnInit {


  @ViewChild('popupOrderPromo') popupOrderPromo!: TemplateRef<ElementRef>;
  orderPromoDialogRef: MatDialogRef<any> | null = null;

  @ViewChild('popupOrder') popupOrder!: TemplateRef<ElementRef>;
  orderDialogRef: MatDialogRef<any> | null = null;

  @ViewChild('popupSuccess') popupSuccess!: TemplateRef<ElementRef>;
  successDialogRef: MatDialogRef<any> | null = null;


  articles: ArticleType[] = [];
  categories: string[] = ['Создание сайтов', 'Продвижение', 'Реклама', 'Копирайтинг'];


  orderForm = this.fb.group({
    service: ['', Validators.required],
    name: ['', [Validators.required, Validators.pattern(/^[А-ЯЁ][а-яё]*(\s[А-ЯЁ][а-яё]*)*$/)]],
    phone: ['', Validators.required]
  });


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
    },
    nav: false
  }

  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
    },
    nav: false
  }


  reviews = [
    {
      name: 'Станислав',
      image: 'reviews.png',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.',
    },
    {
      name: 'Анастасия',
      image: 'reviews2.png',
      text: 'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.',
    },
    {
      name: 'Илья',
      image: 'reviews3.png',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!',
    },
    {
      name: 'Марат',
      image: 'reviews4.png',
      text: 'АйтиШторм превратила наши идеи в живой и яркий сайт, который полностью отражает дух нашего бренда. Мы даже не ожидали такого потрясающего результата за столь короткие сроки! Отличная работа!',
    },
    {
      name: 'Яника',
      image: 'reviews5.png',
      text: 'Благодаря команде АйтиШторм, наш интернет-магазин не просто работает стабильно, но и выглядит современно, что уже привлекло нам множество новых клиентов. Профессионалы своего дела!',
    },
    {
      name: 'Марина',
      image: 'reviews6.png',
      text: 'АйтиШторм показала себя настоящими мастерами в своем деле — сделали не просто сайт, а полноценную платформу для нашего бизнеса. Теперь всё работает как часы, и поток заказов растет с каждым днем!',
    },
  ]

  constructor(private fb: FormBuilder, private articlesService: ArticlesService, private dialog: MatDialog, private router: Router,
              private serviceService: ServiceService, private _snackBar: MatSnackBar, private orderService: OrderService) {
  }

  ngOnInit(): void {
    //Запрашиваем лучшие статьи, чтобы отрисовать на странице блок с лучшими статьями
    this.articlesService.getBestArticles()
      .subscribe((data: ArticleType[]): void => {
        this.articles = data;
      })
  }


  openPromoPopup(): void {
    this.orderPromoDialogRef = this.dialog.open(this.popupOrderPromo);
    this.orderForm.patchValue({
      service: '',
    });
    //Очищаем форму после скрытия формы
    this.orderPromoDialogRef.afterClosed()
      .subscribe((): void => {
        this.orderForm.reset();
      });
  }


  openPopup(serviceName: string): void {
    this.orderDialogRef = this.dialog.open(this.popupOrder);
    this.orderForm.patchValue({
      service: serviceName
    });
    //Очищаем форму после скрытия формы
    this.orderDialogRef.afterClosed()
      .subscribe((): void => {
        this.orderForm.reset();
      });
  }


  createOrder(): void {
    if (this.orderForm.valid && this.orderForm.value.service
      && this.orderForm.value.name && this.orderForm.value.phone) {

      const orderType: ServiceType = ServiceType.Order;

      const paramsObject: OrderType = {
        service: this.orderForm.value.service,
        name: this.orderForm.value.name,
        phone: this.orderForm.value.phone,
        type: orderType,
      };

      this.orderService.createOrder(paramsObject)
        .subscribe({
          next: (data: OrderType | DefaultResponseType): void => {
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }
            if (error) {
              this._snackBar.open(error);
            }
            if (data) {
              this.orderPromoDialogRef?.close();
              this.orderDialogRef?.close();
              this.successDialogRef = this.dialog.open(this.popupSuccess);
              this.successDialogRef.backdropClick().subscribe((): void => {
                this.router.navigate(['/']);
              });
            } else {
              this._snackBar.open('Ошибка при отправке заявки');
            }
          },
          error: (error: HttpErrorResponse): void => {
            this._snackBar.open(error.error.message);
            throw new Error(error.error.message);
          }
        });
    }
  }


  closePromoPopup(): void {
    this.orderPromoDialogRef?.close();
    this.router.navigate(['/']);
  }

  closePopup(): void {
    this.orderDialogRef?.close();
    this.router.navigate(['/']);
  }


  closeSuccessPopup(): void {
    this.successDialogRef?.close();
    this.router.navigate(['/']);
  }
}




