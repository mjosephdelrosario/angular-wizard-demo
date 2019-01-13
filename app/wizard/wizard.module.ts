import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {DynamicFormModule} from "../dynamic-form/dynamic-form.module";
import {WizardComponent} from "./wizard.component";
import {CommonModule} from "@angular/common";
import {HttpModule} from '@angular/http';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    DynamicFormModule
  ],
  declarations: [
    WizardComponent
  ],
  exports: [
      WizardComponent
  ]
})
export class WizardModule {}
