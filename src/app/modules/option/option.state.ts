import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { DEFAULT_REFINE, SearchOption, USER_HOME_FOLDER } from '../../common/entity/option';
import { open } from '@tauri-apps/plugin-dialog';
import * as immutable from 'object-path-immutable';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AddOption, ChangeInput, ChangeOption, DeleteOption } from './option.action';

export interface OptionStateModel {
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
  refines: SearchOption[];
  refinesOptions: SearchOption[];
}

@State<OptionStateModel>({
  name: 'option',
  defaults: {
    includes: [USER_HOME_FOLDER],
    includesOptions: [],
    excludes: [],
    excludesOptions: [],
    refines: [DEFAULT_REFINE],
    refinesOptions: [],
  },
})
@Injectable({
  providedIn: 'root',
})
export class OptionState implements NgxsOnInit {
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      includes: state.includes || [USER_HOME_FOLDER],
      includesOptions: state.includesOptions || [],
      excludes: state.excludes || [],
      excludesOptions: state.excludesOptions || [],
      refines: state.refines || [],
    });
  }

  @Action(AddOption)
  addOption(ctx: StateContext<OptionStateModel>, {type, input}: AddOption) {
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

  addWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', input: string) {
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

  addOptionWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', input: string | null) {
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

  @Action(ChangeOption)
  changeOption(ctx: StateContext<OptionStateModel>, {type, idx, input}: ChangeOption) {
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

  changeWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', idx: number, input: string | null) {
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

  @Action(DeleteOption)
  deleteOption(ctx: StateContext<OptionStateModel>, {type, idx}: DeleteOption) {
    let option = ctx.getState()[type][idx];
    let optionIdx = ctx.getState()[`${type}Options`].findIndex((s: any) => s.input === option.input);
    let newState = ctx.getState();
    newState = immutable.del(newState, [type, idx]);
    newState = immutable.del(newState, [`${type}Options`, optionIdx]);
    ctx.setState(newState);
  }

  @Action(ChangeInput)
  changeInput(ctx: StateContext<OptionStateModel>, {type, idx, input}: ChangeInput) {
    ctx.setState(immutable.set(ctx.getState(), [type, idx, 'input'], input));
  }
}
