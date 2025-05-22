import { isDevMode, makeEnvironmentProviders } from '@angular/core';
import { SystemState } from './system/system.state';
import { NgxsModuleOptions, NoopNgxsExecutionStrategy, provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { RouterStateSerializer, withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { CustomRouterStateSerializer } from './router/custom-router-state-serializer';
import { OptionState } from '../../modules/option/option.state';
import { ResultState } from '../../modules/result/result.state';
import { SearchState } from '../../modules/search/search.state';

export const states = [
  SystemState,
  OptionState,
  ResultState,
  SearchState,
];
export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: isDevMode(),
  selectorOptions: {
    suppressErrors: false,
  },
  compatibility: {
    strictContentSecurityPolicy: true,
  },
  executionStrategy: NoopNgxsExecutionStrategy,
};

export function provideNgxs() {
  return makeEnvironmentProviders([
    provideStore(
      states,
      ngxsConfig,
      withNgxsStoragePlugin({keys: '*'}),
      withNgxsFormPlugin(),
      withNgxsRouterPlugin(),
    ),
    {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
  ]);
}
