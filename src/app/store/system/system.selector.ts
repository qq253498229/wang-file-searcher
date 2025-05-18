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

  static includeOptions() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.includeOptions;
      },
    );
  }

  static excludes() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.excludes;
      },
    );
  }

  static excludeOptions() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.excludeOptions;
      },
    );
  }
}
