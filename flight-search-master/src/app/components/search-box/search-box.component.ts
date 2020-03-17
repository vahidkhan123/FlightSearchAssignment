import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService } from 'src/app/services/search.service';
import { CustomService } from 'src/app/services/custom.service';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private searchService: SearchService,
              private cs: CustomService) { }

  searchForm: FormGroup;
  originCities: string[] = [];
  destinationCities: string[] = [];
  isOneway: boolean = true;
  currentDate =  new Date().toJSON().slice(0,10).replace(/-/g,'-');

  ngOnInit() {

    this.searchForm = this.fb.group({
      type: ['oneway'],
      origin: [null, [Validators.required]],
      destination: [null, [Validators.required]],
      departureDate: [null, [Validators.required]],
      returnDate: [null],
      passengers: ['', [Validators.required]],
      price: [20000]
    });

    //Subscribe for auto suggestion of city names.
    this.onOriginChange();
    this.onDestinationChange();

    this.onWayTypeChange(); // Dynamically update validation for return date based on trip type.
    this.onWardDateChange(); // Validate return date based on onward date
    this.onRetrunDateChange(); // Validate onward date based on return date
    this.onRefineSearch(); // Refine search result on change of Price slider
  }

  /**
   * @params: None
   * @purpose: On origin input change auto suggest city names
  */
  onOriginChange()
  {
    this.searchForm.get('origin')
      .valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap( (searchKey: string) => {
          let destingation = this.searchForm.get('destination').value;
          return this.searchService.autoSuggestCities(searchKey, destingation);
        })
      )
      .subscribe( (cities ) => {
        this.originCities = [...cities];
      })
  }

  /**
   * @params: None
   * @purpose: On destination input change auto suggest city names
  */
  onDestinationChange() {
    this.searchForm.get('destination')
      .valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap( (searchKey: string) => {
          let origin = this.searchForm.get('origin').value;
          return this.searchService.autoSuggestCities(searchKey, origin);
        })
      )
      .subscribe( (cities ) => {
        this.destinationCities = [...cities];
      })
  }

  /**
   * To dynmically set validation rules to return type based on trip type selection.
   */
  onWayTypeChange() {
    let retrunDateControler = this.searchForm.get('returnDate');

    this.searchForm.get('type').valueChanges
      .subscribe( (value: string) => {
        if (value === 'oneway') {
          retrunDateControler.clearValidators();
          retrunDateControler.setValue(null);
        }
        else {
          retrunDateControler.setValidators([Validators.required]);
        }
        retrunDateControler.updateValueAndValidity();
      })
  }

  /**
   * @params: None
   * @purpose: To validate onward and return dates upon selection
  */
  onWardDateChange() {
    this.searchForm.get('departureDate').valueChanges
      .subscribe( (stDate: string) => {
        if ( ! this.isOneway)
        {
          let retDateControl = this.searchForm.get('returnDate');
          if (stDate && retDateControl && retDateControl.value)
          {
            if (new Date(stDate) > new Date(retDateControl.value))
            {
              retDateControl.setValue(null);
            }
          }
        }
      })
  }

  /**
   * @params: None
   * @purpose: To validate onward and return dates upon selection
  */
  onRetrunDateChange() {
    this.searchForm.get('returnDate').valueChanges
      .subscribe( (retDate: string) => {
        if ( ! this.isOneway)
        {
          let onwardDateControl = this.searchForm.get('departureDate');
          if (retDate && onwardDateControl && onwardDateControl.value)
          {
            if (new Date(retDate) < new Date(onwardDateControl.value))
            {
              onwardDateControl.setValue(null);
            }
          }
        }
      })
  }

  /**
   * @params: String field Name
   * @purpose: Clear input value of source and destination on focus.
  */
  clearInput(fieldName: string) {
    //this.searchForm.get(fieldName).setValue('');
  }

  /**
   * @params: String selected city value and String: Field Name
   * @purpose: On select of auto suggested city set the respective values
  */
  onSelectAutoSuggestedCity(selectedCity: string, fieldName: string) {
    this.searchForm.get(fieldName).setValue(selectedCity, {emitEvent: false});
    this.closeDropDown(fieldName);
  }

  /**
   * @params: String: Field Name
   * @purpose: On select of auto suggested values close the drop down
  */
  private closeDropDown(fieldName: string) {
    if ('origin' === fieldName)
      this.originCities = [];
    else
      this.destinationCities = [];
  }

  /**
   * @params: none
   * @purpose: To refine search result if the form is valid
  */
  onRefineSearch() {
    this.searchForm.get('price').valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe( (updatedValue) => {
        if (this.searchForm.valid)
          this.searchFlights();
      })
  }

  /**
   * @params: none
   * @purpose: To search flights if the input values are valid
   * @returns: Void
  */
  searchFlights() {
    if (this.searchForm.valid)
      this.searchService.searchFlights(this.searchForm.value);
    else
      this.cs.markFieldsAsTouched(this.searchForm);
  }
}
