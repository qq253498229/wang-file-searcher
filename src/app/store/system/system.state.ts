import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import {
  AddOption,
  ChangeInput,
  ChangeOption,
  DeleteOption,
  OpenFolder,
  OperationMenu,
  ReceiveResult,
  ReceiveStatus,
  Search,
  StopSearch,
  SwitchSearch,
} from './system.action';
import { SearchOption, USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';
import { Observable } from 'rxjs';
import { open } from '@tauri-apps/plugin-dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Menu } from '@tauri-apps/api/menu/menu';

export interface SystemStateModel {
  /**
   * 搜索结果
   */
  result: any[];
  /**
   * 搜索文本
   */
  textForm: any;
  /**
   * 搜索选项
   */
  includes: SearchOption[];
  includesOptions: SearchOption[];
  /**
   * 排除选项
   */
  excludes: SearchOption[];
  excludesOptions: SearchOption[];
  /**
   * 搜索是否结束
   */
  isStop: boolean;
  statusPath: string;
  statusTime: number;
  searchStartTime: number;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    result: [],
    textForm: {},
    includes: [USER_HOME_FOLDER],
    includesOptions: [],
    excludes: [],
    excludesOptions: [],
    isStop: true,
    statusPath: ``,
    statusTime: 0,
    searchStartTime: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      result: state.result || [],
      textForm: state.textForm || {},
      includes: state.includes || [USER_HOME_FOLDER],
      includesOptions: state.includesOptions || [],
      excludes: state.excludes || [],
      excludesOptions: state.excludesOptions || [],
      isStop: true,
      statusPath: ``,
      statusTime: 0,
      searchStartTime: 0,
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>) {
    let searchStartTime = new Date().getTime();
    ctx.patchState({isStop: false, result: [], searchStartTime});
    let includes = ctx.getState().includes;
    let excludes = ctx.getState().excludes;
    let param = {
      text: ctx.getState().textForm.model.text.trim(),
      includes,
      excludes,
    };
    invoke('search', {param}).then();
  }

  @Action(ReceiveResult)
  receiveResult(ctx: StateContext<SystemStateModel>, {events}: ReceiveResult): Observable<any> | void {
    let newState = ctx.getState();
    for (let e of events) {
      if (e.payload.is_done) continue;
      newState = immutable.push(newState, ['result'], e.payload);
    }
    ctx.setState(newState);
    if (ctx.getState().result.length > 10000) {
      return ctx.dispatch(new StopSearch());
    }
  }

  @Action(StopSearch)
  async stopSearch(ctx: StateContext<SystemStateModel>) {
    await invoke('stop_search');
    ctx.patchState({isStop: true});
  }

  @Action(ChangeOption)
  changeOption(ctx: StateContext<SystemStateModel>, {type, idx, input}: ChangeOption) {
    if (input === '$CUSTOM$') {
      open({multiple: false, directory: true}).then((r) => {
        this.changeWithCheck(ctx, type, idx, r);
        this.addOptionWithCheck(ctx, type, r);
      });
      return;
    } else if (input === '') {
      let option = {label: '', type: 'PartPath', input: '', flag: 'input'};
      ctx.setState(immutable.set(ctx.getState(), [type, idx], option));
      return;
    }
    this.changeWithCheck(ctx, type, idx, input);
    this.addOptionWithCheck(ctx, type, input);
  }

  changeWithCheck(ctx: StateContext<SystemStateModel>, type: 'includes' | 'excludes', idx: number, input: string | null) {
    if (!input || ctx.getState()[type].findIndex((s: any, i: number) => s.input === input && i !== idx) !== -1) {
      this.message.info(`路径已经存在`);
      let oldOption = ctx.getState()[type][idx];
      ctx.setState(immutable.set(ctx.getState(), [type, idx], {label: '', type, input: '', flag: 'custom'}));
      setTimeout(() => {
        ctx.setState(immutable.set(ctx.getState(), [type, idx], oldOption));
      });
      return;
    }
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'custom'};
    }
    ctx.setState(immutable.set(ctx.getState(), [type, idx], option));
  }

  @Action(AddOption)
  addOption(ctx: StateContext<SystemStateModel>, {type, input}: AddOption) {
    // input:'' 手动选择本地目录
    // input:'~' 用户HOME目录
    // type:'includes'
    // type:'excludes'
    if (input === '$CUSTOM$') {
      open({multiple: false, directory: true}).then((r) => {
        if (!r) return;
        this.addWithCheck(ctx, type, r);
        this.addOptionWithCheck(ctx, type, r);
      });
      return;
    } else if (input === '') {
      let option = {label: '', type: 'PartPath', input: '', flag: 'input'};
      ctx.setState(immutable.push(ctx.getState(), [type], option));
      return;
    }
    this.addWithCheck(ctx, type, input);
    this.addOptionWithCheck(ctx, type, input);
  }

  addWithCheck(ctx: StateContext<SystemStateModel>, type: 'includes' | 'excludes', input: string) {
    if (ctx.getState()[type].findIndex((s: any) => s.input === input) !== -1) {
      this.message.info(`路径已经存在`);
      return;
    }
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'custom'};
    }
    ctx.setState(immutable.push(ctx.getState(), [type], option));
  }

  addOptionWithCheck(ctx: StateContext<SystemStateModel>, type: 'includes' | 'excludes', input: string | null) {
    // 如果是空值，说明取消了选择框，那么需要先设置成别的值然后再改回来，否则select值会改变
    // 如果有值，则判断是否合法
    if (!input || input === '~' || ctx.getState()[`${type}Options`].findIndex((s: any) => s.input === input) !== -1) {
      return;
    }
    // 兜底，最后添加选项
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'custom'};
    }
    ctx.setState(immutable.push(ctx.getState(), [`${type}Options`], option));
  }

  @Action(DeleteOption)
  deleteOption(ctx: StateContext<SystemStateModel>, {type, idx}: DeleteOption) {
    ctx.setState(immutable.del(ctx.getState(), [type, idx]));
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
    invoke('open_folder', {path}).then();
  }

  @Action(ChangeInput)
  changeInput(ctx: StateContext<SystemStateModel>, {type, idx, input}: ChangeInput) {
    ctx.setState(immutable.set(ctx.getState(), [type, idx, 'input'], input));
  }

  @Action(ReceiveStatus)
  receiveStatus(ctx: StateContext<SystemStateModel>, {data}: ReceiveStatus) {
    if (data.isDone) {
      let statusTime = new Date().getTime();
      ctx.patchState({statusTime});
    } else if (!!data.payload.path) {
      let oldTime = ctx.getState().statusTime;
      let statusTime = new Date().getTime();
      if ((statusTime - oldTime) < 300) {
        return;
      }
      let statusPath = data.payload.path;
      ctx.patchState({statusPath, statusTime});
    }
  }

  @Action(SwitchSearch)
  switchSearch(ctx: StateContext<SystemStateModel>) {
    if (ctx.getState().isStop) {
      return ctx.dispatch(new Search());
    } else {
      return ctx.dispatch(new StopSearch());
    }
  }

}
