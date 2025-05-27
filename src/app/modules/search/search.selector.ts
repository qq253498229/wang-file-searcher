import { createSelector } from '@ngxs/store';
import { SearchState, SearchStateModel } from './search.state';

export class SearchSelector {
  static text() {
    return createSelector([SearchState], (state: SearchStateModel) => {
        return state.textForm.model.text.trim();
      },
    );
  }
}
