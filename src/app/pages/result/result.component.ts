import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';
import { NzTableModule } from 'ng-zorro-antd/table';
import { OpenFolder } from '../../store/system/system.action';

@Component({
  selector: 'wang-result',
  imports: [CommonModule, SharedModule, NzTableModule],
  templateUrl: './result.component.html',
  styles: [],
})
export class ResultComponent implements OnInit {
  store = inject(Store);
  result = this.store.selectSignal(SystemSelector.result());

  comparePath(a: any, b: any) {
    return a.path.localeCompare(b.path);
  }

  compareUpdateAt(a: any, b: any) {
    return a.update_at - b.update_at;
  }

  ngOnInit() {

  }

  openInLocal(data: any) {
    this.store.dispatch(new OpenFolder(data.path));
  }
}
