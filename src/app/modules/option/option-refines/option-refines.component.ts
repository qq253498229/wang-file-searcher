import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { OptionSelector } from '../option.selector';
import { Store } from '@ngxs/store';
import { AddOption, ChangeValue, DeleteOption } from '../option.action';

@Component({
  selector: 'wang-option-refines',
  imports: [CommonModule, SharedModule],
  templateUrl: './option-refines.component.html',
  styles: ``,
})
export class OptionRefinesComponent {
  store = inject(Store);
  refines = this.store.selectSignal(OptionSelector.refines());

  add(type: 'includes' | 'excludes' | 'refines',
      field: 'label' | 'type' | 'input' | 'flag',
      value: string): void {
    this.store.dispatch(new AddOption(type, field, value));
  }

  changeValue(type: 'includes' | 'excludes' | 'refines',
              field: 'label' | 'type' | 'input' | 'flag', idx: number, value: any) {
    this.store.dispatch(new ChangeValue(type, field, idx, value));
  }

  delete(type: 'includes' | 'excludes' | 'refines', idx: number) {
    this.store.dispatch(new DeleteOption(type, idx));
  }
}
