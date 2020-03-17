import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { SearchResponse } from 'src/app/models/search-response';
import { Subscription } from 'rxjs';

@Component({
  selector: 'search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy {

  constructor(private ds: SearchService) { }
  searchResults: SearchResponse;
  searchResultSubscription: Subscription;
  showResult: boolean = false;
  emptyResult: boolean = false;

  ngOnInit() {
    this.searchResultSubscription = this.ds.searchResultSubject
                                    .subscribe( (res: SearchResponse) => {
                                      this.searchResults = res;
                                      this.showResult   = !res.isEmptyResult;
                                      this.emptyResult  =   res.isEmptyResult;
                                    })
  }

  ngOnDestroy() {
    this.searchResultSubscription.unsubscribe();
  }
}
