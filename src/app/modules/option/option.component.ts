import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { select, Store } from '@ngxs/store';
import { OptionRefinesComponent } from './option-refines/option-refines.component';
import { OptionLocationsComponent } from './option-locations/option-locations.component';
import { ConfigSelector } from '../config/config.selector';
import { UseConfig } from '../config/config.action';

@Component({
  selector: 'wang-option',
  imports: [CommonModule, SharedModule, OptionRefinesComponent, OptionLocationsComponent],
  templateUrl: './option.component.html',
  styles: ``,
})
export class OptionComponent implements OnInit {
  store = inject(Store);
  isDevMode = isDevMode();
  configs = select(ConfigSelector.configs());
  current = select(ConfigSelector.current());

  ngOnInit(): void {
  }

  test() {
    console.log('configs', this.store.selectSnapshot(ConfigSelector.configs()));
    console.log('current', this.store.selectSnapshot(ConfigSelector.current()));
  }

  changeCurrent($event: any) {
    this.store.dispatch(new UseConfig($event));
  }
}
