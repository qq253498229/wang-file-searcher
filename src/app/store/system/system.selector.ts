import { createSelector } from '@ngxs/store';
import { SystemState, SystemStateModel } from './system.state';

export class SystemSelector {
  static result() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.result;
      },
    );
  }

  static isStop() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.isStop;
      },
    );
  }

  static includes() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.includes;
      },
    );
  }

  static includesOptions() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.includesOptions;
      },
    );
  }

  static excludes() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.excludes;
      },
    );
  }

  static excludesOptions() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.excludesOptions;
      },
    );
  }

  static status() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        if (state.isStop && state.statusPath === '') {
          return '';
        }
        if (state.isStop) {
          return `搜索完成，搜索到${state.result.length}个文件，总计耗时:${(state.statusTime - state.searchStartTime) / 1000}秒`;
        } else {
          return `正在搜索:${state.statusPath}`;
        }
      },
    );
  }
}
