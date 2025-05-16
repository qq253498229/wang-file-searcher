import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Store } from '@ngxs/store';
import { SystemSelector } from '../../store/system/system.selector';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'wang-result-group',
  imports: [CommonModule, SharedModule, NzTableModule],
  templateUrl: './result-group.component.html',
  styles: [],
})
export class ResultGroupComponent implements OnInit {
  store = inject(Store);
  searchResult = this.store.selectSignal(SystemSelector.searchResult());

  listOfColumn = [
    {
      title: '路径',
      compare: (a: any, b: any) => a.path.localeCompare(b.path),
      priority: false,
      sortDirections: ['descend', 'ascend', null],
      sortOrder: null,
    },
    {
      title: '大小',
      compare: (a: any, b: any) => a.size - b.size,
      priority: false,
      sortDirections: ['descend', 'ascend', null],
      sortOrder: null,
    },
    {
      title: '创建时间',
      compare: (a: any, b: any) => a.create_at - b.create_at,
      priority: 2,
      sortDirections: ['descend', 'ascend', null],
      sortOrder: null,
    },
    {
      title: '更新时间',
      compare: (a: any, b: any) => a.update_at - b.update_at,
      priority: 1,
      sortDirections: ['descend', 'ascend', null],
      sortOrder: 'descend',
    },
  ];

  ngOnInit() {

  }
}
