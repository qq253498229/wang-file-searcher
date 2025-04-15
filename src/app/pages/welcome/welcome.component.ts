import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';
import { SystemAction } from '../../store/system/system.action';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  imports: [CommonModule, SharedModule, NzDividerModule],
})
export class WelcomeComponent {
  testState: Signal<number> = this.store.selectSignal(SystemSelector.testState());

  constructor(private store: Store) {
  }

  test() {
    this.store.dispatch(new SystemAction.ChangeTestState());
  }
}
