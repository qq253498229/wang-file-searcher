import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { Store } from '@ngxs/store';
import { Search } from '../../store/system/system.action';

@Component({
  selector: 'wang-content-input-group',
  imports: [CommonModule, SharedModule],
  templateUrl: './content-input-group.component.html',
  styles: [],
})
export class ContentInputGroupComponent implements OnInit {
  searchText = ``;
  @ViewChild('searchInputRef') searchInputRef!: ElementRef;
  store = inject(Store);

  async ngOnInit() {
    await this.globalRegisterShortcut();
  }

  async globalRegisterShortcut() {
    await this.registerShortcut();
    await listen('tauri://blur', async () => {
      await unregisterAll();
    });
    await listen('tauri://focus', async () => {
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
    this.store.dispatch(new Search(this.searchText.trim()));
  }
}
