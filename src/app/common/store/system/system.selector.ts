import { createSelector } from '@ngxs/store';
import { SystemState, SystemStateModel } from './system.state';

export class SystemSelector {
  static language() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.language;
      },
    );
  }
}
