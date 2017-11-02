import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-fax',
  templateUrl: './fax.component.html'
})
export class FaxComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() name: string;
  formName: string;
  fax: any;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.formName = 'fax';
    this[this.formName] = this.formBuilder.group({
      areaCode: [null, Validators.maxLength(3)],
      extension: [null, [Validators.minLength(1), Validators.maxLength(6)]],
      number: [null, Validators.maxLength(4)],
      prefix: [null, Validators.maxLength(3)],
      tenDigit: ['', [Validators.minLength(10), Validators.maxLength(10)]]
    });
    this.parentForm.addControl(this.formName, this[this.formName]);
    this.fax = this.parentForm.get('fax');

    this.parentForm.get('fax.extension').valueChanges.subscribe(value => {
      if (value) {
        this.parentForm
          .get('fax.tenDigit')
          .setValidators([Validators.minLength(10), Validators.maxLength(10), Validators.required]);
        this.parentForm.get('fax.tenDigit').updateValueAndValidity();
      } else {
        this.parentForm.get('fax.tenDigit').setValidators([Validators.minLength(10), Validators.maxLength(10)]);
        this.parentForm.get('fax.tenDigit').updateValueAndValidity();
      }
    });

    this.parentForm.get('fax.tenDigit').valueChanges.subscribe(value => {
      if (value) {
        this.parentForm.patchValue({ fax: { areaCode: value.substring(0, 3) } });
        this.parentForm.patchValue({ fax: { prefix: value.substring(3, 6) } });
        this.parentForm.patchValue({ fax: { number: value.substring(6, 10) } });
      }
    });
  }
}
