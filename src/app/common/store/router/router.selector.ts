import { createSelector } from '@ngxs/store';
import { RouterState } from '@ngxs/router-plugin';
import { RouterStateParams } from './custom-router-state-serializer';

export class RouterSelector {
  static url() {
    return createSelector([RouterState], (state: RouterStateParams) => {
        return state.url;
      },
    );
  }

  static params() {
    return createSelector([RouterState], (state: RouterStateParams) => {
        return state.params;
      },
    );
  }

  static queryParams() {
    return createSelector([RouterState], (state: RouterStateParams) => {
        return state.queryParams;
      },
    );
  }
}
