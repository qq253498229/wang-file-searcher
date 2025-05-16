import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { ContentInputGroupComponent } from './pages/content-input-group/content-input-group.component';
import { LocationGroupComponent } from './pages/location-group/location-group.component';
import { ResultGroupComponent } from './pages/result-group/result-group.component';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@ngxs/store';
import { ReceiveResult } from './store/system/system.action';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, ContentInputGroupComponent, LocationGroupComponent, ResultGroupComponent],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  store = inject(Store);

  ngOnInit(): void {
    listen(`search_result`, (e: any) => {
      if (!!e.is_done && e.is_done === true) {
        alert('搜索完成');
      } else {
        console.log('callback===', e);
        this.store.dispatch(new ReceiveResult(e));
      }
    }).then();
  }
}
