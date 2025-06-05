import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { CopyToClipboard, OpenFolder, OperationMenu } from './system.action';
import { invoke } from '@tauri-apps/api/core';
import { Menu } from '@tauri-apps/api/menu/menu';
import { from } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface SystemStateModel {
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {},
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  clipboard = inject(Clipboard);
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    ctx.patchState({});
  }

  @Action(OperationMenu)
  operationMenu(ctx: StateContext<SystemStateModel>, {data}: OperationMenu) {
    Menu.new({
      items: [
        {
          id: 'openFolder', text: '打开本地目录', action: () => {
            ctx.dispatch(new OpenFolder(data.path));
          },
        },
      ],
    }).then(menu => {
      menu.popup().then();
    });
  }

  @Action(OpenFolder)
  openFolder(_ctx: StateContext<SystemStateModel>, {path}: OpenFolder) {
    return from(invoke('open_folder', {path}));
  }

  @Action(CopyToClipboard)
  copyToClipboard(_ctx: StateContext<SystemStateModel>, {text}: CopyToClipboard) {
    this.clipboard.copy(text);
    this.message.success(`复制成功`);
  }

}
