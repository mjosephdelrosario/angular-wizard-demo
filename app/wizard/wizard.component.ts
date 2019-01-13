import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DynamicFormComponent} from "../dynamic-form/containers/dynamic-form/dynamic-form.component";
import {SetupConfig} from "./model/setup-config.interface";
import {Validators} from "@angular/forms";

import {FieldConfig} from "../dynamic-form/models/field-config.interface";
import {StepConfig} from "./model/step-config.interface";

import * as _ from "lodash";

import {Observable} from 'rxjs';
import {Http} from "@angular/http";

@Component({
  selector: 'wizard',
  styleUrls: ['wizard.component.scss'],
  template: `
    <div class="wizard">
      <ng-container *ngFor="let stepConfig of _local.setupConfig.lsStepConfig; let i = index">
        <div *ngIf="i == _local.currentStep">
          <h5 *ngIf="stepConfig?.title" class="text-center"> {{ stepConfig.title }} </h5>
          <p *ngIf="form && _config?.isDebug">
            {{ 'isValid: ' + isValidStep(i) + ', :: ' + (form.value | json)}}
          </p>
          <div *ngIf="_local?.lsInfo?.length"
               class="alert alert-success" role="alert">
            <label *ngFor="let info of _local.lsInfo">
              <strong *ngIf="_local?.isFinish"> Done processing! </strong>
              {{ info }}
            </label>
          </div>
          <div *ngIf="_local?.lsError?.length"
               class="alert alert-warning" role="alert">
            <label *ngFor="let error of _local.lsError">{{ error }}</label>
          </div>
          <dynamic-form
            [config]="stepConfig.lsFieldConfig"
            #form="dynamicForm">
          </dynamic-form>
          <div class="row">
            <div class="col-md-12">
              <div class="form-button float-right">
                <button type="button" (click)="processData(form.value, stepConfig, i)">
                  {{ (isLastStep(i)? 'Finish': 'Next') }}
                </button>
              </div>
              <div class="form-button float-right">
                <button type="button" [disabled]="i == 0" (click)="back()">
                  {{ 'Back' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class WizardComponent implements AfterViewInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  @Output() sendWizardData: EventEmitter <any> = new EventEmitter<any>();

  @Input('setupConfig')
  set setSetupConfig(setupConfig: SetupConfig){
    if(setupConfig) {
      // this.populateButtons(setupConfig);
      let _local = {
        setupConfig  : setupConfig,
        currentStep  : 0,
        totalStep    : _.get(setupConfig, "lsStepConfig.length"),
        lsDoneStep   : <number[]>[],
        isFinish     : false,
        lsError      : <string[]>[],
        lsInfo       : <string[]>[],
        wizardData   : {}
      };
      this._local = Object.assign({}, this._local, _local);
    }
  }

  /*--------------------*
   * Variables
   *--------------------*/
  _config = {
    isDebug : false
  };

  _local: {
    setupConfig  : SetupConfig,
    currentStep  : number,
    totalStep    : number,
    lsDoneStep   : number[],
    isFinish     : boolean,
    // Error
    lsError      : string[],
    lsInfo       : string[],
    // Output
    wizardData   : {[key: string]: any}
  };

  constructor(private http: Http){}

  /*--------------------*
   * Component lifecycle
   *--------------------*/
  ngOnInit(): void {}

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    // Initialize default values here, if any
    this.form.setValue('firstName', 'Mark Joseph');
  }
  /*----------------*
   * Services
   *----------------*/

  isLastStep(index: number){
    return (index == this._local.totalStep - 1);
  }

  back() {
    let _local = this._local;
    if(_local.currentStep > 0){
      _local.currentStep--;
      _.set(this._local, "lsError", []);
    }
  }

  processData(value: {[name: string]: any}, stepConfig: StepConfig, index: number) {
    let isLastStep = this.isLastStep(index);
    let _local = this._local;

    if(this.isValidStep(index)) {
      this.setStepConfigData(value, index);
      if(isLastStep){
        console.log("isValid:true,isLastStep:true -- Send To Api")
        // Finish
        let restUrl = _.get(this._local, "setupConfig.restUrl");
        if(restUrl){
          // TODO: Call api here.
          // If DONE
          this.post(restUrl, this._local.wizardData).subscribe((data) => {
            console.log(data);
            this._local.isFinish = true;
            this._local.lsInfo.push(" sent to: " + restUrl);
          });
        }
      } else {
        // Next
        _local.currentStep++;
      }
      // Remove any error labels
      _.set(this._local, "lsError", []);
      // Push to done steps
      this._local.lsDoneStep.push(index);
    } else {
      this.populateError(stepConfig);
    }
    let logLbl = (isLastStep) ? 'Finish': 'Next';
    console.log(logLbl+ ': ' + JSON.stringify(value, null, 2));
  }

  isValidStep(index: number){
    if(_.isNil(this.form) || _.isNil(this._local)){
      return false;
    }
    return this.form.valid || this._local.lsDoneStep.includes(index);
  }

  populateError(stepConfig: StepConfig){
    _.set(this._local, "lsError", []);
    let lsErrorFieldLbl: string[] = [];
    stepConfig.lsFieldConfig.forEach((fieldConfig) => {
      // this.form.controls
      if(false == _.get(this.form, ["form","controls",fieldConfig.name,"valid"])){
        lsErrorFieldLbl.push(fieldConfig.label);
      }
    });
    if(lsErrorFieldLbl.length){
      let errorMsg = _.map(lsErrorFieldLbl, (o) => '`' + o + '`').join(", ") + " is/are invalid";
      this._local.lsError.push(errorMsg);
    }
  }

  setStepConfigData(data: {[name: string]: any}, index: number){
    let currStepConfig = this._local.setupConfig.lsStepConfig[index];
    currStepConfig.lsFieldConfig.forEach((fieldConfig) => {
      // Set the assigned value
      fieldConfig.value = data[fieldConfig.name];
      // Cannot edit anymore
      fieldConfig.disabled = true;
    });
    this._local.wizardData = Object.assign({}, this._local.wizardData, data);
    console.log("wizardData: " + JSON.stringify(this._local.wizardData, null, 2));
  }

  post(url: string, model: any): Observable <any> {
    let formData: FormData = new FormData();
    formData.append('id', model.id);
    formData.append('applicationName', model.applicationName);
    // return this.http.post(url, formData)
    //     .map((response: Response) => {
    //       return response;
    //     }).catch(this.handleError);
    return this.http.post(url, formData);
  }

  /**
   * Handle HTTP error
   */
  private handleError (error: any) {
    const errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead

    return Observable.of(errMsg);
  }
}
