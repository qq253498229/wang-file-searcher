import { createSelector } from '@ngxs/store';
import { OptionState, OptionStateModel } from './option.state';

export class OptionSelector {

  static includes() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.includes;
      },
    );
  }

  static includesOptions() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.includesOptions;
      },
    );
  }

  static excludes() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.excludes;
      },
    );
  }

  static excludesOptions() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.excludesOptions;
      },
    );
  }

}
