import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnChanges, NgxsOnInit, NgxsSimpleChange, State, StateContext } from '@ngxs/store';
import {
  AddExclude,
  AddInclude, ChangeExclude,
  ChangeInclude,
  ReceiveResult, RemoveExclude,
  RemoveInclude,
  Search,
  StopSearch,
} from './system.action';
import { INCLUDE_OPTIONS, SearchOption, USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';
import { Observable } from 'rxjs';
import { open } from '@tauri-apps/plugin-dialog';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  includes: any;
  includeOptions: any;
  /**
   * 排除选项
   */
  excludes: any;
  excludeOptions: any;
  /**
   * 搜索是否结束
   */
  isStop: boolean;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    result: [],
    textForm: {},
    includes: [USER_HOME_FOLDER],
    includeOptions: [],
    excludes: [],
    excludeOptions: [],
    isStop: true,
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
      result: [],
      textForm: state.textForm || {},
      includes: state.includes || [USER_HOME_FOLDER],
      includeOptions: state.includeOptions || INCLUDE_OPTIONS,
      excludes: state.excludes || [],
      excludeOptions: state.excludeOptions || [],
      isStop: state.isStop || true,
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>) {
    ctx.patchState({isStop: false, result: []});
    let param = {
      text: ctx.getState().textForm.model.text.trim(),
      // includes: ctx.getState().searchOptionForm.model.includes,
      includes: [
        {input: `/Users/wangbin/src/own/wang-file-searcher/wang-file-searcher/src-tauri/tests`, type: 'FullPath'},
        // {input: `D:\\src\\own\\wang-file-searcher\\src-tauri\\tests`, type: 'FullPath'},
      ],
      // includes: [{input: `D:\\src`, type: 'FullPath'}],
      excludes: [
        {input: 'target', type: 'PartPath'},
        {input: 'node_modules', type: 'PartPath'},
        {input: '.idea', type: 'PartPath'},
        {input: '.angular', type: 'PartPath'},
        {input: '.vscode', type: 'PartPath'},
        {input: 'dist', type: 'PartPath'},
        // {input: 'yarn.lock', type: 'PartPath'},
      ],
    };
    // console.log('options', options);
    invoke('search', {param}).then();
    // return ctx.dispatch([new UpdateFormValue({path: 'system.textForm', value: {text: ''}})]);
  }

  @Action(ReceiveResult)
  receiveResult(ctx: StateContext<SystemStateModel>, {data}: ReceiveResult): Observable<any> | void {
    let path = data.payload.path;
    if (ctx.getState().result.findIndex(s => s.path === path) !== -1) {
      return;
    }
    if (ctx.getState().result.length > 10000) {
      return ctx.dispatch(new StopSearch());
    }
    let newState = immutable.push(ctx.getState(), ['result'], data.payload);
    ctx.setState(newState);
  }

  @Action(StopSearch)
  async stopSearch(ctx: StateContext<SystemStateModel>) {
    await invoke('stop_search');
    ctx.patchState({isStop: true});
  }

  @Action(ChangeInclude)
  changeInclude(ctx: StateContext<SystemStateModel>, {idx, type}: ChangeInclude) {
    if (type === '~') {
      ctx.setState(immutable.set(ctx.getState(), ['includes', idx], USER_HOME_FOLDER));
      return;
    }
    if (type !== '') {
      let findIndex = ctx.getState().includes.findIndex((s: any, i: number) => {
        return i !== idx && s.input === type;
      });
      if (findIndex !== -1) {
        this.message.info(`路径已经存在`);
        let option = ctx.getState().includes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['includes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['includes', idx], option));
        });
        return;
      }
      let option = ctx.getState().includeOptions.find((s: any) => s.input === type);
      ctx.setState(immutable.set(ctx.getState(), ['includes', idx], option));
      return;
    }
    open({multiple: false, directory: true}).then((r) => {
      if (!r || r.trim().length === 0) {
        let option = ctx.getState().includes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['includes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['includes', idx], option));
        });
        return;
      }
      if (ctx.getState().includes.findIndex((s: any) => s.input === r) !== -1) {
        this.message.info(`路径已经存在`);
        let option = ctx.getState().includes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['includes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['includes', idx], option));
        });
        return;
      }
      let option = {label: r, type: 'FullPath', input: r, flag: 'custom'};
      let newState = immutable.set(ctx.getState(), ['includes', idx], option);
      if (ctx.getState().includeOptions.findIndex((s: any) => s.input === r) === -1) {
        newState = immutable.push(newState, ['includeOptions'], option);
      }
      ctx.setState(newState);
    });
  }

  @Action(ChangeExclude)
  changeExclude(ctx: StateContext<SystemStateModel>, {idx, type}: ChangeExclude) {
    if (type !== '') {
      let findIndex = ctx.getState().excludes.findIndex((s: any, i: number) => {
        return i !== idx && s.input === type;
      });
      if (findIndex !== -1) {
        this.message.info(`路径已经存在`);
        let option = ctx.getState().excludes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], option));
        });
        return;
      }
      let option = ctx.getState().excludeOptions.find((s: any) => s.input === type);
      ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], option));
      return;
    }
    open({multiple: false, directory: true}).then((r) => {
      if (!r || r.trim().length === 0) {
        let option = ctx.getState().excludes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], option));
        });
        return;
      }
      if (ctx.getState().excludes.findIndex((s: any) => s.input === r) !== -1) {
        this.message.info(`路径已经存在`);
        let option = ctx.getState().excludes[idx];
        ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], {label: '', type: ''}));
        setTimeout(() => {
          ctx.setState(immutable.set(ctx.getState(), ['excludes', idx], option));
        });
        return;
      }
      let option = {label: r, type: 'FullPath', input: r, flag: 'custom'};
      let newState = immutable.set(ctx.getState(), ['excludes', idx], option);
      if (ctx.getState().excludeOptions.findIndex((s: any) => s.input === r) === -1) {
        newState = immutable.push(newState, ['excludeOptions'], option);
      }
      ctx.setState(newState);
    });
  }

  @Action(AddInclude)
  addInclude(ctx: StateContext<SystemStateModel>, {type}: AddInclude) {
    if (type === '~') {
      ctx.setState(immutable.push(ctx.getState(), ['includes'], USER_HOME_FOLDER));
      return;
    }
    if (type === '') {
      open({multiple: false, directory: true}).then((r) => {
        if (!r || r.trim().length === 0) {
          return;
        }
        if (ctx.getState().includes.findIndex((s: any) => s.input === r) !== -1) {
          this.message.info(`路径已经存在`);
          return;
        }
        let option = {label: r, type: 'FullPath', input: r, flag: 'custom'};
        let newState = immutable.push(ctx.getState(), ['includes'], option);
        if (ctx.getState().includeOptions.findIndex((s: any) => s.input === r) === -1) {
          newState = immutable.push(newState, ['includeOptions'], option);
        }
        ctx.setState(newState);
      });
      return;
    }
    if (ctx.getState().includes.findIndex((s: any) => s.input === type) !== -1) {
      this.message.info(`路径已经存在`);
      return;
    }
    let option = ctx.getState().includeOptions.find((s: any) => s.input === type);
    ctx.setState(immutable.push(ctx.getState(), ['includes'], option));
    return;
  }

  @Action(AddExclude)
  addExclude(ctx: StateContext<SystemStateModel>) {
    open({multiple: false, directory: true}).then((r) => {
      if (!r || r.length === 0) {
        return;
      }
      if (ctx.getState().excludes.findIndex((s: any) => s.input === r) !== -1) {
        this.message.info(`路径已经存在`);
        return;
      }
      let option = {label: r, type: 'FullPath', input: r, flag: 'custom'};
      let newState = immutable.push(ctx.getState(), ['excludes'], option);
      if (ctx.getState().excludeOptions.findIndex((s: any) => s.input === r) === -1) {
        newState = immutable.push(newState, ['excludeOptions'], option);
      }
      ctx.setState(newState);
    });
  }

  @Action(RemoveInclude)
  removeInclude(ctx: StateContext<SystemStateModel>, {idx}: RemoveInclude) {
    let newState = immutable.del(ctx.getState(), ['includes', idx]);
    ctx.setState(newState);
  }

  @Action(RemoveExclude)
  removeExclude(ctx: StateContext<SystemStateModel>, {idx}: RemoveExclude) {
    let newState = immutable.del(ctx.getState(), ['excludes', idx]);
    ctx.setState(newState);
  }

}
