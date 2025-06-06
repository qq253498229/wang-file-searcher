import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './common/shared.module';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@ngxs/store';
import { bufferTime, Subject } from 'rxjs';
import { ReceiveResult, ReceiveStatus } from './modules/result/result.action';
import { RouterOutlet } from '@angular/router';
import { InitConfig } from './modules/config/config.action';
import { InitLanguage } from './common/store/system/system.action';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterOutlet],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(new InitConfig());
    this.listenResult();
    this.listenStatus();
    this.store.dispatch(new InitLanguage());
  }

  /**
   * 监听搜索结构事件
   * @private
   */
  private listenResult() {
    let subject = new Subject<any>();
    listen(`result`, (e: any) => {
      subject.next(e);
    }).then();
    // 防抖，解决页面刷新过快导致的卡顿
    subject.pipe(bufferTime(1000)).subscribe(r => {
      if (!r || r.length === 0) return;
      this.store.dispatch(new ReceiveResult(r));
    });
  }

  /**
   * 监听状态事件
   * @private
   */
  private listenStatus() {
    let subject = new Subject<any>();
    listen(`status`, (e: any) => {
      subject.next(e);
    }).then();
    // 防抖，解决页面刷新过快导致的卡顿
    subject.pipe(bufferTime(400)).subscribe(r => {
      if (!r || r.length === 0) return;
      this.store.dispatch(new ReceiveStatus(r[r.length - 1]));
    });
  }
}
