import {Component, HostListener, OnInit} from '@angular/core';
import {ActiveParamsType} from "../../../../../types/active-params.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticlesType} from "../../../../../types/articles.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ServicesType} from "../../../../../types/services.type";
import {ServiceService} from "../../../shared/services/service.service";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {AppliedFilterType} from "../../../../../types/applied-filter.type";


@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  pages: number[] = [];
  activeParams: ActiveParamsType = {categories: []};
  articles: ArticlesType['items'] = [];
  appliedFilters: AppliedFilterType[] = [];
  services: ServicesType[] = [];
  sortingOpen: boolean = false;


  constructor(private articlesService: ArticlesService, private serviceService: ServiceService, private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    //Запрашиваем услуги, чтобы отрисовать в фильтре
    this.serviceService.getServices()
      .subscribe((data: ServicesType[] | DefaultResponseType): void => {
        this.services = data as ServicesType[];

        this.activatedRoute.queryParams
          .subscribe(params => {
            // Очищаем фильтры перед их пересозданием
            this.appliedFilters = [];
            this.activeParams = ActiveParamsUtil.processParams(params);
            // Проходим по категориям, чтобы найти соответствующие услуги
            this.activeParams.categories?.forEach((url: string): void => {
              const foundType: ServicesType | undefined = this.services.find((item: ServicesType): boolean => item.url === url);

              if (foundType) {
                // Добавляем фильтр, если найден
                this.appliedFilters.push({
                  name: foundType.name,
                  urlParam: foundType.url
                });
              }
            });

            //Запрашиваем все статьи, чтобы отрисовать их на странице c учетом фильтрации передавая this.activeParams
            this.articlesService.getArticles(this.activeParams)
              .subscribe((data: ArticlesType): void => {
                this.pages = [];
                for (let i: number = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }
                this.articles = data.items;
              })
          });
      });
  }


  //Функции пагинации
  openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    })
  }


  openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
    } else {
      this.activeParams.page = 2;
    }
    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    })
  }

  openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;

      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      })
    }
  }


  //Функция сварачивания блока фильтрации
  toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen
  }


  updateFilterParam(url: string): void {
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingServiceInParams: string | undefined = this.activeParams.categories.find((item: string): boolean => item === url);

      if (existingServiceInParams) {
        // Если сервис уже выбран, то убираем его
        this.activeParams.categories = this.activeParams.categories.filter((item: string): boolean => item !== url);
      } else {
        // Если сервис не выбран, добавляем его
        this.activeParams.categories = [...this.activeParams.categories, url];
      }
    } else {
      // Если фильтр пуст, добавляем текущий сервис
      this.activeParams.categories = [url];
    }


    // Обновляем страницу
    this.activeParams.page = 1;
    this.router.navigate(['/blog'], {
      queryParams: this.activeParams,
    })

  }

  removeAppliedFilter(appliedFilter: AppliedFilterType): void {
    this.activeParams.categories = this.activeParams.categories?.filter((item: string): boolean => item !== appliedFilter.urlParam);
    this.activeParams.page = 1;
    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    })
  }


  //Скрытие блока с сортировкой по клику в любое место браузера
  @HostListener('document:click', ['$event'])
  click(event: Event): void {
    const target: HTMLElement = event.target as HTMLElement;

    // Проверка, чтобы убедиться, что клик был не внутри элемента с классом catalog-sorting
    if (this.sortingOpen && !target.closest('.blog-sorting')) {
      this.sortingOpen = false;
    }
  }

}

