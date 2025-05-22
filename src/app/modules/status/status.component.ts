import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { Store } from '@ngxs/store';
import { ResultSelector } from '../result/result.selector';

@Component({
  selector: 'wang-status',
  imports: [CommonModule, SharedModule],
  templateUrl: './status.component.html',
  styles: ``,
})
export class StatusComponent {
  store = inject(Store);
  status = this.store.selectSignal(ResultSelector.status());
}
