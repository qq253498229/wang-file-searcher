import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { ContentInputGroupComponent } from './pages/content-input-group/content-input-group.component';
import { LocationGroupComponent } from './pages/location-group/location-group.component';
import { ResultGroupComponent } from './pages/result-group/result-group.component';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@ngxs/store';
import { ReceiveResult, StopSearch } from './store/system/system.action';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, ContentInputGroupComponent, LocationGroupComponent, ResultGroupComponent],
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
