import { Component } from '@angular/core';
import { OptionComponent } from '../../modules/option/option.component';
import { ResultComponent } from '../../modules/result/result.component';
import { StatusComponent } from '../../modules/status/status.component';
import { TextInputComponent } from '../../modules/text-input/text-input.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'wang-layout',
  imports: [CommonModule, SharedModule,
    TextInputComponent, OptionComponent, ResultComponent, StatusComponent],
  templateUrl: './layout.component.html',
  styles: ``,
})
export class LayoutComponent {

}
