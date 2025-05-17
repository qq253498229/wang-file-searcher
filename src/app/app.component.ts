import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@ngxs/store';
import { ReceiveResult, StopSearch } from './store/system/system.action';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TextInputComponent } from './pages/text-input/text-input.component';
import { OptionComponent } from './pages/option/option.component';
import { ResultComponent } from './pages/result/result.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, TextInputComponent, OptionComponent, ResultComponent],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  store = inject(Store);
  notify = inject(NzNotificationService);

  ngOnInit(): void {
    listen(`search_result`, (e: any) => {
      if (!!e.payload.is_done && e.payload.is_done === true) {
        this.notify.success(`搜索完成`, ``, {nzDuration: 0});
        this.store.dispatch(new StopSearch());
      } else {
        this.store.dispatch(new ReceiveResult(e));
      }
    }).then();
  }
}
