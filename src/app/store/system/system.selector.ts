import { createSelector } from '@ngxs/store';
import { SystemState, SystemStateModel } from './system.state';

export class SystemSelector {
  static testState() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.testState;
      },
    );
  }
}
