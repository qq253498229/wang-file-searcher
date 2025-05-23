import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { Store } from '@ngxs/store';
import { Search, StopSearch } from '../../store/system/system.action';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemSelector } from '../../store/system/system.selector';

@Component({
  selector: 'wang-text-input',
  imports: [CommonModule, SharedModule],
  templateUrl: './text-input.component.html',
  styles: [],
})
export class TextInputComponent implements OnInit {
  store = inject(Store);
  fb = inject(FormBuilder);

  @ViewChild('searchInputRef') searchInputRef!: ElementRef;

  textForm: FormGroup = this.fb.group({
    text: ['', Validators.required],
  });
  isStop = this.store.selectSignal(SystemSelector.isStop());

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
    this.store.dispatch(new Search());
  }

  stopSearch() {
    this.store.dispatch(new StopSearch());
  }

  get searchText() {
    return this.textForm.getRawValue().text;
  }

  set searchText(value) {
    this.textForm.patchValue({text: value});
  }
}
