import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AddOption, ChangeOption, DeleteOption } from '../../store/system/system.action';

@Component({
  selector: 'wang-option',
  imports: [CommonModule, SharedModule,
    NzDropDownModule, NzTypographyModule, NzSelectModule, NzDividerModule],
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
})
export class OptionComponent implements OnInit {
  store = inject(Store);

  includes = this.store.selectSignal(SystemSelector.includes());
  includesOptions = this.store.selectSignal(SystemSelector.includesOptions());
  excludes = this.store.selectSignal(SystemSelector.excludes());
  excludesOptions = this.store.selectSignal(SystemSelector.excludesOptions());

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
}
