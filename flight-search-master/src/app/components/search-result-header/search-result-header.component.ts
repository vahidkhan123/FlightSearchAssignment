import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchResultHeader } from 'src/app/models/search-header';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'search-result-header',
  templateUrl: './search-result-header.component.html',
  styleUrls: ['./search-result-header.component.css']
})
export class SearchResultHeaderComponent implements OnInit, OnDestroy {

  constructor(private ds: SearchService) { }

  searchResultHeader: SearchResultHeader;
  headerSubscription: Subscription

  ngOnInit() {
    this.headerSubscription = this.ds.searchQuerySubject
                              .subscribe( (searchQuery: SearchResultHeader) => {
                                this.searchResultHeader = searchQuery;
                              })
  }

  ngOnDestroy() {
    this.headerSubscription.unsubscribe();
  }
}
