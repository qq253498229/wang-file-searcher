import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { NzPageHeaderComponent } from 'ng-zorro-antd/page-header';
import { select, Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { EditConfigRow, InitConfig, SaveConfig, SaveCurrentConfig, UseConfig } from '../config.action';
import { OpenFolder } from '../../../common/store/system/system.action';
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
  tempData: any = undefined;
  isDevMode = isDevMode();

  ngOnInit(): void {
    this.store.dispatch(new InitConfig());
  }

  onBack() {
    this.store.dispatch(new Navigate(['/']));
  }

  saveCurrentConfig() {
    this.store.dispatch(new SaveCurrentConfig());
  }

  openInLocal() {
    appLocalDataDir().then(data => {
      this.store.dispatch(new OpenFolder(data));
    });
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

}
