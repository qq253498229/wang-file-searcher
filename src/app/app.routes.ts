import { Routes } from '@angular/router';
import { ConfigComponent } from './modules/config/config/config.component';
import { LayoutComponent } from './common/layout/layout.component';

export const routes: Routes = [
  {path: '', component: LayoutComponent},
  {path: 'config', component: ConfigComponent},
  {path: '**', redirectTo: ''},
];
