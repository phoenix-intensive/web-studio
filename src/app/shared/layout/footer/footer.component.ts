import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ServiceType} from "../../../../../types/service.type";
import {OrderType} from "../../../../../types/order.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, Validators} from "@angular/forms";
import {ArticlesService} from "../../services/articles.service";
import {Router} from "@angular/router";
import {ServiceService} from "../../services/service.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {


  @ViewChild('popupSuccess') popupSuccess!: TemplateRef<ElementRef>;
  successDialogRef: MatDialogRef<any> | null = null;

  @ViewChild('popupConsultation') popupConsultation!: TemplateRef<ElementRef>;
  consultationDialogRef: MatDialogRef<any> | null = null;


  orderForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[А-ЯЁ][а-яё]*(\s[А-ЯЁ][а-яё]*)*$/)]],
    phone: ['', [Validators.required]]
  });


  constructor(private fb: FormBuilder, private articlesService: ArticlesService, private dialog: MatDialog, private router: Router,
              private serviceService: ServiceService, private _snackBar: MatSnackBar, private orderService: OrderService) {
  }

  ngOnInit(): void {
  }


  openConsultationPopup(): void {
    this.consultationDialogRef = this.dialog.open(this.popupConsultation);

    //Очищаем инпуты после скрытия формы по клику на любое место браузера
    this.consultationDialogRef.afterClosed()
      .subscribe((): void => {
        this.orderForm.reset();
      });
  }


  createConsultation(): void {
    if (this.orderForm.valid && this.orderForm.value.name && this.orderForm.value.phone) {

      const orderType: ServiceType = ServiceType.Consultation;

      const paramsObject: OrderType = {
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
              this.consultationDialogRef?.close();
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

  closeConsultationPopup(): void {
    this.consultationDialogRef?.close();
    this.orderForm.reset();
  }


  closeSuccessPopup(): void {
    this.successDialogRef?.close();
    this.orderForm.reset();
  }
}
