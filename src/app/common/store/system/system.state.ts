import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { ChangeLanguage, InitLanguage, OpenFolder } from './system.action';
import { invoke } from '@tauri-apps/api/core';
import { from } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import translateEnUs from '../../../../assets/i18n/en-US.json';
import translateZhCn from '../../../../assets/i18n/zh-CN.json';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';

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
  i18n = inject(NzI18nService);

  ngxsOnInit(ctx: StateContext<any>): void {
    ctx.patchState({});
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
    this.translate.setDefaultLang('en-US');
    let useLang = ctx.getState().language || defaultLanguage;
    this.translate.use(useLang);
    if ('zh-CN' === useLang) {
      this.i18n.setLocale(zh_CN);
    } else {
      this.i18n.setLocale(en_US);
    }
    this.translate.setTranslation('en-US', translateEnUs);
    this.translate.setTranslation('zh-CN', translateZhCn);
    ctx.patchState({language: this.translate.currentLang});
  }

  @Action(ChangeLanguage)
  changeLanguage(ctx: StateContext<SystemStateModel>, {language}: ChangeLanguage) {
    if ('zh-CN' === language) {
      this.i18n.setLocale(zh_CN);
    } else {
      this.i18n.setLocale(en_US);
    }
    this.translate.use(language);
    ctx.patchState({language});
  }

}
