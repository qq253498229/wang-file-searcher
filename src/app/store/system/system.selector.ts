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
}
