import { createSelector } from '@ngxs/store';
import { ResultState, ResultStateModel } from './result.state';
import { inject } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { SystemState, SystemStateModel } from '../../common/store/system/system.state';

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
    let translate = inject(TranslateService);
    return createSelector([ResultState, SystemState],
      (state: ResultStateModel, _system: SystemStateModel) => {
        if (state.isStop && state.statusPath === '') {
          return '';
        }
        if (state.isStop) {
          return translate.instant(_('status.searchDone'), {
            length: state.result.length,
            seconds: (state.statusTime - state.searchStartTime) / 1000,
          });
        } else {
          return translate.instant(_('status.searching'), {path: state.statusPath});
        }
      },
    );
  }

}
