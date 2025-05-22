import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OptionSelector } from '../../store/option/option.selector';
import { ResultSelector } from '../../store/result/result.selector';
import { AddOption, ChangeInput, ChangeOption, DeleteOption } from '../../store/option/option.action';

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

  refines = [
    {type: 'filename', mode: 'is', input: ''},
  ];

  ngOnInit(): void {
  }

  get hasHomeInclude() {
    return this.includes().findIndex(s => s.input === '~') !== -1;
  }

  add(type: 'includes' | 'excludes', input: string): void {
    this.store.dispatch(new AddOption(type, input));
  }

  change(type: 'includes' | 'excludes', idx: number, input: string) {
    this.store.dispatch(new ChangeOption(type, idx, input));
  }

  delete(type: 'includes' | 'excludes', idx: number) {
    this.store.dispatch(new DeleteOption(type, idx));
  }

  test() {
    console.log('refines', this.refines);
    console.log(this.store.selectSnapshot(ResultSelector.result()));
  }

  changeInput(type: 'includes' | 'excludes', idx: number, input: string) {
    this.store.dispatch(new ChangeInput(type, idx, input));
  }
}
