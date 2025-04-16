import { Component, ElementRef, OnInit, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';

@Component({
  selector: 'wang-content-input-group',
  imports: [
    CommonModule, SharedModule,
  ],
  templateUrl: './content-input-group.component.html',
  styles: [],
})
export class ContentInputGroupComponent implements OnInit {
  searchText = ``;
  @ViewChild('searchInputRef') searchInputRef!: ElementRef;
  onTextChange = output<string>();

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
    this.onTextChange.emit(this.searchText.trim());
  }
}
