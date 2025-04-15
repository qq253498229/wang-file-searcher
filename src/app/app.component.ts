import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { listen } from '@tauri-apps/api/event';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, NzMenuModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  searchText = ``;
  @ViewChild('searchInputRef') searchInputRef!: ElementRef;

  async ngOnInit() {
    await this.globalRegisterShortcut();
  }

  async globalRegisterShortcut() {
    await this.registerShortcut();
    await listen('tauri://blur', async event => {
      await unregisterAll();
    });
    await listen('tauri://focus', async event => {
      await this.registerShortcut();
    });
  }

  async registerShortcut() {
    await unregisterAll();
    await register('CommandOrControl+/', (e) => {
      if (e.state === 'Released') {
        this.searchInputRef.nativeElement.focus();
      }
    });
  }

  search() {
    console.log('search', this.searchText);
  }
}
