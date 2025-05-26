import { Routes } from '@angular/router';
import { OptionConfigComponent } from './modules/option/option-config/option-config.component';
import { LayoutComponent } from './common/layout/layout.component';

export const routes: Routes = [
  {path: '', component: LayoutComponent},
  {path: 'config', component: OptionConfigComponent},
  {path: '**', redirectTo: ''},
];
