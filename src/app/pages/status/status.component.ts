import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SystemSelector } from '../../store/system/system.selector';
import { Store } from '@ngxs/store';

@Component({
  selector: 'wang-status',
  imports: [CommonModule, SharedModule],
  templateUrl: './status.component.html',
  styles: ``,
})
export class StatusComponent {
  store = inject(Store);
  status = this.store.selectSignal(SystemSelector.status());
}
