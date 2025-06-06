import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from './icons-provider';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxs } from './common/store';
import { provideTranslateService, TranslateCompiler } from '@ngx-translate/core';
import { CustomLanguageCompiler } from './modules/lang/custom-language-compiler';

registerLocaleData(zh);
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(FormsModule),
    provideNzIcons(icons),
    provideHttpClient(),
    provideNgxs(),
    provideTranslateService({
      defaultLanguage: 'en-US',
      compiler: {provide: TranslateCompiler, useClass: CustomLanguageCompiler},
    }),
  ],
};
