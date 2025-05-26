import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { NzPageHeaderComponent } from 'ng-zorro-antd/page-header';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { NzTableComponent } from 'ng-zorro-antd/table';

@Component({
  selector: 'wang-option-config',
  imports: [CommonModule, SharedModule, NzPageHeaderComponent, NzTableComponent],
  templateUrl: './option-config.component.html',
  styles: ``,
})
export class OptionConfigComponent {
  store = inject(Store);
  dataSet: any[] = [];

  onBack() {
    this.store.dispatch(new Navigate(['/']));
  }

}
