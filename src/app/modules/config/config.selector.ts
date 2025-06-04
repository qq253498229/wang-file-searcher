import { createSelector } from '@ngxs/store';
import { ConfigState, ConfigStateModel } from './config.state';

export class ConfigSelector {
  static configs() {
    return createSelector([ConfigState], ((state: ConfigStateModel) => {
      return state.configs;
    }));
  }

  static current() {
    return createSelector([ConfigState], ((state: ConfigStateModel) => {
      return state.current;
    }));
  }
}
