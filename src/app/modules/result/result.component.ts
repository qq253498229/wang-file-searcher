import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { Store } from '@ngxs/store';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ResultSelector } from './result.selector';
import { OpenFolder } from '../../common/store/system/system.action';

@Component({
  selector: 'wang-result',
  imports: [CommonModule, SharedModule, NzTableModule],
  templateUrl: './result.component.html',
  styles: [],
})
export class ResultComponent implements OnInit {
  store = inject(Store);
  result = this.store.selectSignal(ResultSelector.result());

  ngOnInit() {

  }

  comparePath(a: any, b: any) {
    return a.path.localeCompare(b.path);
  }

  compareUpdateAt(a: any, b: any) {
    return a.update_at - b.update_at;
  }

  openInLocal(data: any) {
    this.store.dispatch(new OpenFolder(data.path));
  }
}
