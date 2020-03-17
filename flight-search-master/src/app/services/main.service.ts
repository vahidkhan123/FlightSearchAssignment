import { Injectable } from '@angular/core';
import {throwError as observableThrowError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MainService {

  private url:string;

  constructor(private http: HttpClient) { }

  protected setUrl(resourceUrl:string) {
    this.url  = environment.apiUrl + resourceUrl;
  }

  getAll() {
    return this.http.get(this.url)
      .pipe(catchError(this.handleError));
  }

  // Handel errors
  protected handleError(error: Response)
  {
    if (error.status === 400)
      return observableThrowError('Bad input error')
    if (error.status === 404)
      return observableThrowError('Not found error')

    return observableThrowError('General error');
  }
}
