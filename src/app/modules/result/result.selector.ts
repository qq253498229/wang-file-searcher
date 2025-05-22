import { createSelector } from '@ngxs/store';
import { ResultState, ResultStateModel } from './result.state';

export class ResultSelector {

  static result() {
    return createSelector([ResultState], (state: ResultStateModel) => {
        return state.result;
      },
    );
  }

  static isStop() {
    return createSelector([ResultState], (state: ResultStateModel) => {
        return state.isStop;
      },
    );
  }

  static status() {
    return createSelector([ResultState], (state: ResultStateModel) => {
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
