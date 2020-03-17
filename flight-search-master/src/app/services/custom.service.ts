import { Injectable } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomService {

  markFieldsAsTouched(group: FormGroup | FormArray) {
    group.markAsTouched()
    for (let i in group.controls)
    {
      if (group.controls[i] instanceof FormControl)
        group.controls[i].markAsTouched();
      else
        this.markFieldsAsTouched(group.controls[i]);
    }
  }
}
