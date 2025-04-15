import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

const THIRD_MODULES: any[] = [
  FormsModule,
  ReactiveFormsModule,
  AsyncPipe,
  JsonPipe,
  NgxsFormDirective,
  NzIconModule,
  NzGridModule,
  NzLayoutModule,
  RouterLink,
  NzButtonModule,
  NzToolTipModule,
  NzModalModule,
  NzFormModule,
  NzInputModule,
];
const COMPONENTS: any[] = [];
const DIRECTIVES: any[] = [];
const PIPES: any[] = [];

@NgModule({
  declarations: [
    ...PIPES,
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  imports: [
    CommonModule,
    ...THIRD_MODULES,
  ],
  exports: [
    ...THIRD_MODULES,
    ...PIPES,
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
})
export class SharedModule {
}
