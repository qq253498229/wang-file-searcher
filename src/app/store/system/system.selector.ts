import { createSelector } from '@ngxs/store';
import { SystemState, SystemStateModel } from './system.state';

export class SystemSelector {
  static result() {
    return createSelector([SystemState], (state: SystemStateModel) => {
        return state.result;
      },
    );
  }
}
