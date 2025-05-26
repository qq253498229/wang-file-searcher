import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { OptionSelector } from '../option.selector';
import { Store } from '@ngxs/store';
import { AddOption, ChangeOption, ChangeValue, DeleteOption } from '../option.action';

@Component({
  selector: 'wang-option-locations',
  imports: [CommonModule, SharedModule],
  templateUrl: './option-locations.component.html',
  styles: ``,
})
export class OptionLocationsComponent {
  store = inject(Store);

  includes = this.store.selectSignal(OptionSelector.includes());
  includesOptions = this.store.selectSignal(OptionSelector.includesOptions());
  excludes = this.store.selectSignal(OptionSelector.excludes());
  excludesOptions = this.store.selectSignal(OptionSelector.excludesOptions());

  add(type: 'includes' | 'excludes' | 'refines',
      field: 'label' | 'type' | 'input' | 'flag',
      value: string): void {
    this.store.dispatch(new AddOption(type, field, value));
  }

  change(type: 'includes' | 'excludes' | 'refines',
         field: 'label' | 'type' | 'input' | 'flag',
         idx: number, value: string) {
    this.store.dispatch(new ChangeOption(type, field, idx, value));
  }

  delete(type: 'includes' | 'excludes' | 'refines', idx: number) {
    this.store.dispatch(new DeleteOption(type, idx));
  }

  changeValue(type: 'includes' | 'excludes' | 'refines',
              field: 'label' | 'type' | 'input' | 'flag', idx: number, value: any) {
    this.store.dispatch(new ChangeValue(type, field, idx, value));
  }

  get hasHomeInclude() {
    return this.includes().findIndex(s => s.input === '~') !== -1;
  }

}
