import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';

@Component({
  selector: 'wang-result-group',
  imports: [CommonModule, SharedModule],
  templateUrl: './result-group.component.html',
  styles: [],
})
export class ResultGroupComponent implements OnInit {
  store = inject(Store);
  result = this.store.selectSignal(SystemSelector.result());

  ngOnInit() {

  }
}
