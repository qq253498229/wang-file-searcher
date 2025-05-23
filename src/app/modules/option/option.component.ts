import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { Store } from '@ngxs/store';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OptionSelector } from './option.selector';
import { AddOption, ChangeOption, ChangeValue, DeleteOption } from './option.action';

@Component({
  selector: 'wang-option',
  imports: [CommonModule, SharedModule,
    NzDropDownModule, NzTypographyModule, NzSelectModule, NzDividerModule],
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
})
export class OptionComponent implements OnInit {
  store = inject(Store);
  isDevMode = isDevMode();

  includes = this.store.selectSignal(OptionSelector.includes());
  includesOptions = this.store.selectSignal(OptionSelector.includesOptions());
  excludes = this.store.selectSignal(OptionSelector.excludes());
  excludesOptions = this.store.selectSignal(OptionSelector.excludesOptions());
  refines = this.store.selectSignal(OptionSelector.refines());

  ngOnInit(): void {
  }

  get hasHomeInclude() {
    return this.includes().findIndex(s => s.input === '~') !== -1;
  }

  add(type: 'includes' | 'excludes' | 'refines', input: string): void {
    this.store.dispatch(new AddOption(type, input));
  }

  change(type: 'includes' | 'excludes' | 'refines', idx: number, input: string) {
    this.store.dispatch(new ChangeOption(type, idx, input));
  }

  delete(type: 'includes' | 'excludes' | 'refines', idx: number) {
    this.store.dispatch(new DeleteOption(type, idx));
  }

  test() {
    console.log('refines', this.store.selectSnapshot(OptionSelector.refines()));
    console.log('includes', this.store.selectSnapshot(OptionSelector.includes()));
    console.log('includesOptions', this.store.selectSnapshot(OptionSelector.includesOptions()));
    console.log('excludes', this.store.selectSnapshot(OptionSelector.excludes()));
    console.log('excludesOptions', this.store.selectSnapshot(OptionSelector.excludesOptions()));
  }

  changeValue(type: 'includes' | 'excludes' | 'refines',
              field: 'label' | 'type' | 'input' | 'flag', idx: number, value: any) {
    this.store.dispatch(new ChangeValue(type, field, idx, value));
  }
}
