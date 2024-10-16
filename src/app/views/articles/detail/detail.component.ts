import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleDetailType} from "../../../../../types/article-detail.type";
import {environment} from "../../../../environments/environment";
import {ArticleType} from "../../../../../types/articles-best.type";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentsType} from "../../../../../types/comments.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {AddCommentType} from "../../../../../types/add-comment.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder} from "@angular/forms";
import {UserReactionType} from "../../../../../types/user-reaction.type";


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  article!: ArticleDetailType;
  articles: ArticleType[] = [];
  comments: CommentsType['comments'] = [];
  serverStaticPath: string = environment.serverStaticPath;
  isLogged: boolean = false;

  allCommentsCount: number = 0;
  loadMoreVisible: boolean = false;
  currentOffset: number = 0; // Для отслеживания текущего offset
  loading: boolean = false;

  userReactions: { [key: string]: 'like' | 'dislike' | null } = {}; // Хранение реакций пользователя
  userViolations: { [commentId: string]: boolean } = {}; // Хранение состояния, был ли отправлен запрос на жалобу

  private formatDate(date: Date): string {
    const day: string = String(date.getDate()).padStart(2, '0');
    const month: string = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому добавляем 1
    const year: number = date.getFullYear();
    const hours: string = String(date.getHours()).padStart(2, '0');
    const minutes: string = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  commentForm = this.fb.group({
    text: ['']
  });

  constructor(private activatedRoute: ActivatedRoute, private articlesService: ArticlesService, private authService: AuthService,
              private commentsService: CommentsService, private _snackBar: MatSnackBar, private fb: FormBuilder) {
    this.isLogged = this.authService.getLoggedIn();
  }


  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      // Очищаем комментарии при смене статьи
      this.comments = [];
      // Сброс реакций при смене статьи
      this.userReactions = {};
      // Загружаем статью с комментариями к ней и связанные статьи
      this.loadArticle(params['url'], params['id']);
    });
  }


  //Метод загрузки статьи
  loadArticle(articleUrl: string | undefined, articleId: string | undefined): void {
    // Проверяем наличие URL
    if (!articleUrl) {
      this._snackBar.open('URL статьи отсутствует');
      return;
    }

    // Загружаем статью
    this.articlesService.getArticle(articleUrl).subscribe({
      next: (data: ArticleDetailType): void => {
        this.article = data; // Сохраняем статью


        // Загружаем комментарии для текущей статьи
        if (articleId) {
          this.loadComments(articleId, 0, 3);
        } else {
          this._snackBar.open('ID статьи отсутствует');
        }
      },
      error: (error: HttpErrorResponse): void => {
        this._snackBar.open(error.message || 'Ошибка при загрузке статьи');
      }
    });

    // Загружаем связанные статьи
    this.articlesService.getRelatedArticle(articleUrl).subscribe({
      next: (data: ArticleType[]): void => {
        this.articles = data; // Сохраняем связанные статьи
      },
      error: (error: HttpErrorResponse): void => {
        this._snackBar.open(error.message || 'Ошибка при загрузке связанных статей');
      }
    });
  }


  //Метод загрузки комментариев с реакциями к ней
  loadComments(articleId: string, offset: number, limit: number = 10): void {
    this.commentsService.getComments(articleId, offset, limit).subscribe({
      next: (data: CommentsType): void => {
        // Обновляем комментарии
        const serverComments = data.comments;

        if (offset === 0) {
          this.comments = [];
        }

        // Форматируем дату для каждого комментария, в нужный нам формат
        const formattedComments = serverComments.map(comment => ({
          ...comment,
          date: this.formatDate(new Date(comment.date))
        }));

        this.comments = this.comments.concat(formattedComments);
        this.allCommentsCount = data.allCount;
        this.currentOffset = this.comments.length;
        this.loadMoreVisible = this.currentOffset < this.allCommentsCount;
        this.loading = false;

        this.userReactions = {}; // Сброс реакций при смене статьи

        // Загружаем реакцию для каждого комментария
        this.comments.forEach(comment => {
          this.getUserReactionForComment(comment.id);
        });
      },
      error: (error: HttpErrorResponse): void => {
        this._snackBar.open(error.message || 'Ошибка при загрузке комментариев');
        this.loading = false;
      }
    });
  }


  //Метод создания комментария
  createComment(): void {
    const articleId: string = this.article.id;

    const paramsObject: AddCommentType = {
      text: this.commentForm.value.text ?? '',
      article: articleId,
    };

    this.commentsService.addComment(paramsObject).subscribe({
      next: (): void => {
        this.commentForm.reset();
        this._snackBar.open('Комментарий добавлен!');

        this.loadComments(articleId, 0, 3)
      },
      error: (error: HttpErrorResponse): void => {
        this._snackBar.open(error.error.message || 'Ошибка при добавлении комментария');
      }
    });
  }


  //Метод получения реакций на комментарий
  getUserReactionForComment(commentId: string): void {
    this.commentsService.getUserReactionComment(commentId)
      .subscribe({
        next: (reaction: UserReactionType[] | DefaultResponseType): void => {
          let error = null;
          if ((reaction as DefaultResponseType).error !== undefined) {
            error = (reaction as DefaultResponseType).message;
          }
          if (error) {
            this._snackBar.open(error);
          }
          if (Array.isArray(reaction)) {
            reaction.forEach((userReaction: UserReactionType): void => {
              this.userReactions[userReaction.comment] = userReaction.action;
            });
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message || 'Не удалось загрузить реакцию');
        }
      });
  }


  //Метод загрузки комментариев, если их больше 4
  loadMoreComments(): void {
    this.loading = true;
    const articleId: string = this.article.id;
    this.loadComments(articleId, this.currentOffset); // Загружаем комментарии, лоадер скроется внутри метода loadComments
  }


  toggleLike(commentId: string): void {
    const commentIndex: number = this.comments.findIndex(comment => comment.id === commentId);

    if (this.userReactions[commentId] === 'like') {
      // Убрать лайк
      this.commentsService.addLike(commentId)
        .subscribe({
          next: (): void => {
            this.userReactions[commentId] = null; // Снимаем реакцию
            this.comments[commentIndex].likesCount--;
            this._snackBar.open('Ваш голос учтен');
          },
          error: (error) => {
            this._snackBar.open('Не удалось снять лайк');
          }
        });
    } else {
      // Если дизлайк, снимаем дизлайк и ставим лайк
      if (this.userReactions[commentId] === 'dislike') {
        this.commentsService.addLike(commentId)
          .subscribe({
            next: (): void => {
              this.userReactions[commentId] = 'like'; // Устанавливаем лайк
              this.comments[commentIndex].likesCount++; // Увеличиваем количество лайков
              this.comments[commentIndex].dislikesCount--; // Уменьшаем количество дизлайков
              this._snackBar.open('Ваш голос учтен');
            },
            error: (error): void => {
              this._snackBar.open('Не удалось обновить вашу реакцию'); // Уведомление об ошибке
            }
          });
      } else {
        // Просто ставим лайк
        this.commentsService.addLike(commentId)
          .subscribe({
            next: (): void => {
              this.userReactions[commentId] = 'like'; // Устанавливаем лайк
              this.comments[commentIndex].likesCount++; // Увеличиваем количество лайков
              this._snackBar.open('Ваш голос учтен');
            },
            error: (error) => {
              this._snackBar.open('Не удалось добавить лайк'); // Уведомление об ошибке
            }
          });
      }
    }
  }


  toggleDislike(commentId: string): void {
    const commentIndex: number = this.comments.findIndex(comment => comment.id === commentId);
    if (this.userReactions[commentId] === 'dislike') {
      // Убрать дизлайк
      this.commentsService.addDislike(commentId).subscribe({
        next: (): void => {
          this.userReactions[commentId] = null; // Снимаем реакцию
          this.comments[commentIndex].dislikesCount--; // Уменьшаем количество дизлайков
          this._snackBar.open('Ваш голос учтен');
        },
        error: (error): void => {
          this._snackBar.open('Не удалось снять дизлайк'); // Уведомление об ошибке
        }
      });
    } else {
      // Если лайк, снять лайк и поставить дизлайк
      if (this.userReactions[commentId] === 'like') {
        this.commentsService.addDislike(commentId).subscribe({
          next: (): void => {
            this.userReactions[commentId] = 'dislike'; // Устанавливаем дизлайк
            this.comments[commentIndex].likesCount--; // Уменьшаем количество лайков
            this.comments[commentIndex].dislikesCount++; // Увеличиваем количество дизлайков
            this._snackBar.open('Ваш голос учтен');
          },
          error: (error): void => {
            this._snackBar.open('Не удалось обновить вашу реакцию'); // Уведомление об ошибке
          }
        });
      } else {
        // Просто поставить дизлайк
        this.commentsService.addDislike(commentId).subscribe({
          next: (): void => {
            this.userReactions[commentId] = 'dislike'; // Устанавливаем дизлайк
            this.comments[commentIndex].dislikesCount++; // Увеличиваем количество дизлайков
            this._snackBar.open('Ваш голос учтен');
          },
          error: (error): void => {
            this._snackBar.open('Не удалось добавить дизлайк'); // Уведомление об ошибке
          }
        });
      }
    }
  }


// Метод обработки клика на иконке жалобы
  reportComment(commentId: string): void {
    // Проверяем, была ли уже отправлена жалоба
    if (this.userViolations[commentId]) {
      this._snackBar.open('Жалоба уже отправлена');
      return;
    }

    // Отправляем жалобу на комментарий
    this.commentsService.addViolate(commentId)
      .subscribe({
        next: (): void => {
          this.userViolations[commentId] = true; // Устанавливаем статус, что жалоба отправлена
          this._snackBar.open('Жалоба отправлена');
        },
        error: (error: HttpErrorResponse): void => {
          this._snackBar.open("Это действие уже применено к комментарию");
        }
      });
  }

}



