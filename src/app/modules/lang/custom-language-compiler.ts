import { InterpolatableTranslationObject, TranslateCompiler, Translation } from '@ngx-translate/core';

export class CustomLanguageCompiler extends TranslateCompiler {
  override compile(value: string, _lang: string) {
    return value;
  }

  override compileTranslations(translations: Translation, _lang: string): InterpolatableTranslationObject {
    for (let key of Object.keys(translations)) {
      translations[key] = this.resolveReferences(translations[key], translations);
    }
    return translations;
  }

  private resolveReferences(value: string, translations: Translation): string {
    return value.replace(/\$\{([^}]+)}/,
        (_substring, args) =>
            this.resolveReferences(translations[args], translations));
  }
}
