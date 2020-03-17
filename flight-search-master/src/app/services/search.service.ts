import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SearchParams } from '../models/search-params';
import { Flights } from '../models/flights';
import { SearchResponse } from '../models/search-response';
import { Subject } from 'rxjs';
import { SearchResultHeader } from '../models/search-header';

@Injectable({
  providedIn: 'root'
})

export class SearchService extends MainService{

  constructor(http: HttpClient) {
    super(http);
  }

  searchResultSubject  = new Subject();
  searchQuerySubject   = new Subject();

  /**
   * @function: autoSuggestCities
   * @params:  String: key
   * @params:  String: exclude
   * @purpose:  To find matching records and return the result
   */
  autoSuggestCities(key: string, exclude: string) {
    this.setUrl('cities.json');
    return this.getAll()
      .pipe(
        map( res => {
          var filteredCities = [];
          if (res['list'])
          {
            filteredCities =  res['list'].filter( (city: string) => {
              return (city.indexOf(key) !== -1 && key);
            })
          }
          return filteredCities
        }
      ));
  }

  /**
   * @function: searchAndSort
   * @params:  Array[]: Flights raw data
   * @params:  SearchParams: search parameters
   * @purpose: To find the flights based on the search criteria
   * @returns: Flights[]: array of flights
  */
  private searchAndSort(data: any, searchParams: SearchParams): Flights[] {
    data.flights.map(x => x.amount = parseInt(x.amount));
    const allFlights: Flights[] = data.flights;

    return this.getMatchingItemsFromArray(this.sortDataByAmount(allFlights), searchParams);
  }

  /**
   * @function: sortDataByAmount
   * @params:  Array[]: Flights raw data
   * @purpose: To To sort flight data with respect to amount
   * @returns: Flights[]: Sorted raw flights data
  */
  private sortDataByAmount(flightData: Flights[]): Flights[] {
    flightData.sort((x, y) => x.amount - y.amount);

    return flightData;
  }

  /**
   * @function: getMatchingItemsFromArray
   * @params:  Flights[]: Array of raw flight data
   * @params:  SearchParams: search parameters
   * @purpose: To find the flights that matches/fulfills search criterias.
   * @returns: Flights[]: Flights data
   */
  private getMatchingItemsFromArray(sortedFlightData: Flights[], searchParams: SearchParams): Flights[] {
    const filteredItmes: Flights[] = [];
    const priceInRange: Flights[] = sortedFlightData.filter(item => {
      return item.amount <= searchParams.price;
    });

    priceInRange.map((x) => {
      if (Date.parse(x.date.split(' ')[0]) === Date.parse(searchParams.departureDate) &&
        x.origin.toLocaleLowerCase() === searchParams.origin.toLocaleLowerCase() &&
        x.destination.toLocaleLowerCase() === searchParams.destination.toLocaleLowerCase()) {
        filteredItmes.push(x);
      }
    });

    return filteredItmes;
  }

  /**
   * @function: searchFlights
   * @params:  SearchParams: search parameters
   * @purpose: To find the flights that matches/fulfills search criterias.
   * @returns: Emits search results
   */
  searchFlights(searchParams: SearchParams) {
    this.setUrl('flight-data.json');
    this.getAll()
      .subscribe( data => {

        let onwardJourney = [];
        let returnJourney = [];
        const isRetrunJourney = searchParams.type === 'return';

        onwardJourney = this.searchAndSort(data, searchParams);

        if (isRetrunJourney)
        {
          const retrunParams: SearchParams = {...searchParams};

          retrunParams.origin = searchParams.destination;
          retrunParams.destination = searchParams.origin;
          retrunParams.departureDate = retrunParams.returnDate;

          returnJourney = this.searchAndSort(data, retrunParams);
        }

        const searchResults: SearchResponse =  {
          oneWayFlights: onwardJourney,
          returningFlights: returnJourney,
          isEmptyResult: onwardJourney.length === 0,
          oneway: !isRetrunJourney,
        };

        const searchResultHeader: SearchResultHeader = {
          source: searchParams.origin,
          destination: searchParams.destination,
          oneWay: !isRetrunJourney,
          startDate: searchParams.departureDate,
          returnDate: searchParams.returnDate
        }

        this.searchResultSubject.next(searchResults);
        this.searchQuerySubject.next(searchResultHeader);
      })
  }
}
