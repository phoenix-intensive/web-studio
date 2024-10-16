import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'truncateText'
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string, limit: number = 100): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.slice(0, limit) + '...';
  }
}
