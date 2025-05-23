import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { DEFAULT_REFINE, SearchOption, USER_HOME_FOLDER } from '../../common/entity/option';
import { open } from '@tauri-apps/plugin-dialog';
import * as immutable from 'object-path-immutable';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AddOption, ChangeOption, ChangeValue, ClearOptions, DeleteOption } from './option.action';

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
  addOption(ctx: StateContext<OptionStateModel>, {type, field, value}: AddOption) {
    if (type === 'includes' || type === 'excludes') {
      if (value === '$CUSTOM$') {
        open({multiple: false, directory: true}).then((r) => {
          if (!r) return;
          this.addWithCheck(ctx, type, r);
          this.addOptionWithCheck(ctx, type, r);
        });
        return;
      } else if (value === '') {
        let option = {label: '', type: 'PartPath', input: '', flag: 'Input'};
        ctx.setState(immutable.push(ctx.getState(), [type], option));
        return;
      }
      this.addWithCheck(ctx, type, value);
      this.addOptionWithCheck(ctx, type, value);
    } else if (type === 'refines') {
      let option = {label: '', type: 'Is', input: '', flag: value};
      ctx.setState(immutable.push(ctx.getState(), [type], option));
      return;
    }
  }

  addWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', input: string) {
    if (ctx.getState()[type].findIndex((s: any) => s.input === input) !== -1) {
      this.message.info(`路径已经存在`);
      return;
    }
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'Custom'};
    }
    ctx.setState(immutable.push(ctx.getState(), [type], option));
  }

  addOptionWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', input: string | null) {
    // 如果是空值，说明取消了选择框，那么需要先设置成别的值然后再改回来，否则select值会改变
    // 如果有值，则判断是否合法
    if (!input || input === '~' || ctx.getState()[`${type}Options`].findIndex((s: any) => s.input === input) !== -1) {
      return ctx.dispatch(new ClearOptions());
    }
    // 兜底，最后添加选项
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'Custom'};
    }
    ctx.setState(immutable.push(ctx.getState(), [`${type}Options`], option));
    return ctx.dispatch(new ClearOptions());
  }

  @Action(ChangeOption)
  changeOption(ctx: StateContext<OptionStateModel>, {type, idx, field, value}: ChangeOption) {
    if (type === 'includes' || type === 'excludes') {
      if (value === '$CUSTOM$') {
        open({multiple: false, directory: true}).then((r) => {
          this.changeWithCheck(ctx, type, idx, r);
          this.addOptionWithCheck(ctx, type, r);
        });
        return;
      } else if (value === '') {
        let option = {label: '', type: 'PartPath', input: '', flag: 'Input'};
        ctx.setState(immutable.set(ctx.getState(), [type, idx], option));
        return;
      }
      this.changeWithCheck(ctx, type, idx, value);
      this.addOptionWithCheck(ctx, type, value);
    }
  }

  changeWithCheck(ctx: StateContext<OptionStateModel>, type: 'includes' | 'excludes' | 'refines', idx: number, input: string | null) {
    if (!input || ctx.getState()[type].findIndex((s: any, i: number) => s.input === input && i !== idx) !== -1) {
      this.message.info(`路径已经存在`);
      let oldOption = ctx.getState()[type][idx];
      ctx.setState(immutable.set(ctx.getState(), [type, idx], {label: '', type, input: '', flag: 'Custom'}));
      setTimeout(() => {
        ctx.setState(immutable.set(ctx.getState(), [type, idx], oldOption));
      });
      return;
    }
    let option = USER_HOME_FOLDER;
    if (input !== '~') {
      option = {label: input, type: 'FullPath', input, flag: 'Custom'};
    }
    ctx.setState(immutable.set(ctx.getState(), [type, idx], option));
  }

  @Action(DeleteOption)
  deleteOption(ctx: StateContext<OptionStateModel>, {type, idx}: DeleteOption) {
    let newState = ctx.getState();
    newState = immutable.del(newState, [type, idx]);
    ctx.setState(newState);
    return ctx.dispatch(new ClearOptions());
  }

  @Action(ChangeValue)
  changeValue(ctx: StateContext<OptionStateModel>, {type, idx, input, field}: ChangeValue) {
    ctx.setState(immutable.set(ctx.getState(), [type, idx, field], input));
    ctx.dispatch(new ClearOptions());
  }

  @Action(ClearOptions)
  clearOptions(ctx: StateContext<OptionStateModel>) {
    let types: ('includes' | 'excludes' | 'refines')[] = ['includes', 'excludes', 'refines'];
    let newState = ctx.getState();
    let flag = false;
    for (let type of types) {
      let options = newState[type];
      let newOptions = newState[`${type}Options`]
        .filter(s => options.findIndex(a => a.input === s.input) !== -1);
      if (newOptions.length !== options.length) {
        flag = true;
        newState = immutable.set(newState, [`${type}Options`], newOptions);
      }
    }
    if (flag) {
      ctx.setState(newState);
    }
  }
}
