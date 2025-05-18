import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  AddExclude,
  AddInclude,
  ChangeExclude,
  ChangeInclude,
  RemoveExclude,
  RemoveInclude,
} from '../../store/system/system.action';

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
  includeOptions = this.store.selectSignal(SystemSelector.includeOptions());
  excludes = this.store.selectSignal(SystemSelector.excludes());
  excludeOptions = this.store.selectSignal(SystemSelector.excludeOptions());

  ngOnInit(): void {
    // let optionForm = this.store.selectSnapshot(SystemSelector.optionForm());
    // console.log('optionForm', this.store.selectSnapshot(SystemSelector.optionForm()));
    // console.log('includes', this.includes());
    // console.log('includeOptions', this.includeOptions());
  }

  test() {
    console.log('test includes', this.includes());
    console.log('test includeOptions', this.includeOptions());
    console.log('test excludes', this.excludes());
    console.log('test excludeOptions', this.excludeOptions());
  }

  get hasHomeInclude() {
    let includes = this.includes() as any[];
    return includes.findIndex(s => s.flag === 'home') !== -1;
  }

  add(type: string, input: string): void {
    if (type === 'includes') {
      this.store.dispatch(new AddInclude(input));
    } else if (type === 'excludes') {
      this.store.dispatch(new AddExclude());
    }
  }

  delete(type: string, idx: number) {
    if (type === 'includes') {
      this.store.dispatch(new RemoveInclude(idx));
    } else if (type === 'excludes') {
      this.store.dispatch(new RemoveExclude(idx));
    }
  }

  changeInclude(type: 'includes' | 'excludes', idx: number, $event: any) {
    if (type === 'includes') {
      this.store.dispatch(new ChangeInclude(idx, $event));
    } else if (type === 'excludes') {
      this.store.dispatch(new ChangeExclude(idx, $event));
    }
  }
}
