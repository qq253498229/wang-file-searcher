import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@ngxs/store';
import { ReceiveResult, ReceiveStatus } from './store/system/system.action';
import { TextInputComponent } from './pages/text-input/text-input.component';
import { OptionComponent } from './pages/option/option.component';
import { ResultComponent } from './pages/result/result.component';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { SystemSelector } from './store/system/system.selector';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { bufferTime, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, SharedModule, TextInputComponent, OptionComponent, ResultComponent, NzDividerComponent, NzTypographyComponent],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  store = inject(Store);
  status = this.store.selectSignal(SystemSelector.status());

  ngOnInit(): void {
    this.listenResult();
    this.listenStatus();
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
