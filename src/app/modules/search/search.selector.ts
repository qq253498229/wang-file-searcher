import { createSelector } from '@ngxs/store';
import { SearchState, SearchStateModel } from './search.state';

export class SearchSelector {
  static testNumber() {
    return createSelector([SearchState], (state: SearchStateModel) => {
        return state.testNumber;
      },
    );
  }
}
