import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { NzPageHeaderComponent } from 'ng-zorro-antd/page-header';
import { select, Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import {
  CopyConfig,
  DeleteConfig,
  EditConfigRow,
  InitConfig,
  OpenConfigFolder,
  OverrideConfig,
  SaveConfig,
  SaveCurrentConfig,
  UseConfig,
} from '../config.action';
import { ConfigSelector } from '../config.selector';
import * as immutable from 'object-path-immutable';

@Component({
  selector: 'wang-config',
  imports: [CommonModule, SharedModule, NzPopconfirmModule,
    NzPageHeaderComponent, NzTableModule],
  templateUrl: './config.component.html',
  styles: ``,
})
export class ConfigComponent implements OnInit {
  store = inject(Store);
  configs = select(ConfigSelector.configs());
  current = select(ConfigSelector.current());
  tempData: any = undefined;
  isDevMode = isDevMode();

  ngOnInit(): void {
  }

  onBack() {
    this.store.dispatch(new Navigate(['/']));
  }

  saveCurrentConfig() {
    this.store.dispatch(new SaveCurrentConfig());
  }

  openConfigFolder() {
    this.store.dispatch(new OpenConfigFolder());
  }

  edit(data: any) {
    this.tempData = data;
    this.store.dispatch(new EditConfigRow(data));
  }

  save() {
    this.store.dispatch(new SaveConfig(this.tempData));
  }

  cancel(data: any) {
    this.store.dispatch(new EditConfigRow(data));
  }

  changeConfigValue(field: string, $event: any) {
    this.tempData = immutable.set(this.tempData, [field], $event);
  }

  useConfig(data: any) {
    this.store.dispatch(new UseConfig(data));
  }

  test() {
    this.store.dispatch(new InitConfig());
  }

  deleteConfig(data: any) {
    this.store.dispatch(new DeleteConfig(data));
  }

  overrideConfig(data: any) {
    this.store.dispatch(new OverrideConfig(data));
  }

  copyConfig(data: any) {
    this.store.dispatch(new CopyConfig(data));
  }
}
