import {Component} from '@angular/core';
import {Validators} from "@angular/forms";
import {StepConfig} from "./wizard/model/step-config.interface";
import {SetupConfig} from "./wizard/model/setup-config.interface";

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  template: `
    <div class="app">
      <wizard [setupConfig]="setupConfig"></wizard>
    </div>
  `
})
export class AppComponent {
  defaultValidators = [Validators.required, Validators.minLength(4)];
  phoneNumberValidators = [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)];

  personStepConfig: StepConfig = {
    title : 'Personal Information',
    lsFieldConfig: [
      {
        type: 'input',
        label: 'First Name',
        name: 'firstName',
        placeholder: 'Enter your first name',
        validation: this.defaultValidators
      },
      {
        type: 'input',
        label: 'Last Name',
        name: 'lastName',
        placeholder: 'Enter your last name',
        validation: this.defaultValidators
      },
    ]
  };

  addressStepConfig: StepConfig = {
    title : 'Address Information',
    lsFieldConfig: [
      {
        type: 'input',
        label: 'Address',
        name: 'address',
        placeholder: 'Enter your address',
        validation: [Validators.required]
      },
      {
        type: 'input',
        label: 'City',
        name: 'city',
        placeholder: 'Enter your city',
        validation: [Validators.required]
      },
      {
        type: 'input',
        label: 'Country',
        name: 'country',
        placeholder: 'Enter your country',
        validation: [Validators.required]
      },
    ]
  };

  contactStepConfig: StepConfig = {
    title : 'Contact Information',
    lsFieldConfig: [
      {
        type: 'input',
        label: 'Email',
        name: 'email',
        placeholder: 'Enter your email',
        validation: [Validators.required, Validators.email]
      },
      {
        type: 'input',
        label: 'Phone Number',
        name: 'phoneNumber',
        placeholder: 'Enter your phone number',
        validation: this.phoneNumberValidators
      },
      {
        type: 'input',
        label: 'Cellphone Number',
        name: 'cellphoneNumber',
        placeholder: 'Enter your cellphone number',
        validation: this.phoneNumberValidators
      },
    ]
  };

  setupConfig: SetupConfig = {
    restUrl     : "http://localhost:4040/api/customer-information",
    lsStepConfig: [
      this.personStepConfig,
      this.addressStepConfig,
      this.contactStepConfig
    ]
  };
}
