import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { ChangeLanguage, InitLanguage, OpenFolder, OperationMenu } from './system.action';
import { invoke } from '@tauri-apps/api/core';
import { Menu } from '@tauri-apps/api/menu/menu';
import { from } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import translateEnUs from '../../../../assets/i18n/en-US.json';
import translateZhCn from '../../../../assets/i18n/zh-CN.json';

export interface SystemStateModel {
  language?: string;
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
  translate = inject(TranslateService);

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

  @Action(InitLanguage)
  initLanguage(ctx: StateContext<SystemStateModel>) {
    let systemLanguage = Intl.DateTimeFormat().resolvedOptions().locale || 'en';
    let defaultLanguage;
    if ('zh-CN' === systemLanguage) {
      defaultLanguage = 'zh-CN';
    } else {
      defaultLanguage = 'en-US';
    }
    this.translate.addLangs(['en-US', 'zh-CN']);
    this.translate.setDefaultLang('zh-CN');
    this.translate.use(ctx.getState().language || defaultLanguage);
    this.translate.setTranslation('en-US', translateEnUs);
    this.translate.setTranslation('zh-CN', translateZhCn);
    ctx.patchState({language: this.translate.currentLang});
  }

  @Action(ChangeLanguage)
  changeLanguage(ctx: StateContext<SystemStateModel>, {language}: ChangeLanguage) {
    this.translate.use(language);
    ctx.patchState({language});
  }

}
