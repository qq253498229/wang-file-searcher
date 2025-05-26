import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { Store } from '@ngxs/store';
import { OptionSelector } from './option.selector';
import { OptionRefinesComponent } from './option-refines/option-refines.component';
import { OptionLocationsComponent } from './option-locations/option-locations.component';

@Component({
  selector: 'wang-option',
  imports: [CommonModule, SharedModule, OptionRefinesComponent, OptionLocationsComponent],
  templateUrl: './option.component.html',
  styles:``
})
export class OptionComponent implements OnInit {
  store = inject(Store);
  isDevMode = isDevMode();

  ngOnInit(): void {
  }

  test() {
    console.log('refines', this.store.selectSnapshot(OptionSelector.refines()));
    console.log('includes', this.store.selectSnapshot(OptionSelector.includes()));
    console.log('includesOptions', this.store.selectSnapshot(OptionSelector.includesOptions()));
    console.log('excludes', this.store.selectSnapshot(OptionSelector.excludes()));
    console.log('excludesOptions', this.store.selectSnapshot(OptionSelector.excludesOptions()));
  }

}
