import {createSelector} from '@ngxs/store';
import {OptionState, OptionStateModel} from './option.state';

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

  static refines() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.refines;
      },
    );
  }

  static refinesOptions() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        return state.refinesOptions;
      },
    );
  }

  static param() {
    return createSelector([OptionState], (state: OptionStateModel) => {
        let includes = state.includes;
        let excludes = state.excludes;
        let refines = state.refines;
        let includesOptions = state.includesOptions;
        let excludesOptions = state.excludesOptions;
        let refinesOptions = state.refinesOptions;
        return {includes, excludes, refines, includesOptions, excludesOptions, refinesOptions} as any;
      },
    );
  }

}
