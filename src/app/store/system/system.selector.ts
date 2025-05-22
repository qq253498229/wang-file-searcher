import { createSelector } from '@ngxs/store';
import { SystemState, SystemStateModel } from './system.state';

export class SystemSelector {
  static testNumber() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.testNumber;
      },
    );
  }
}
