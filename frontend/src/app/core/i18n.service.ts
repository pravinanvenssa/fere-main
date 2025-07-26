import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<string>(
    localStorage.getItem('locale') || environment.defaultLanguage
  );
  
  public currentLocale$ = this.currentLocaleSubject.asObservable();
  
  private translations: { [key: string]: { [key: string]: string } } = {};
  
  constructor() {
    this.loadTranslations(this.currentLocaleSubject.value);
  }
  
  setLocale(locale: string): void {
    if (environment.supportedLanguages.includes(locale)) {
      localStorage.setItem('locale', locale);
      this.currentLocaleSubject.next(locale);
      this.loadTranslations(locale);
      // Reload the page to apply locale changes
      window.location.reload();
    }
  }
  
  getCurrentLocale(): string {
    return this.currentLocaleSubject.value;
  }
  
  getSupportedLocales(): string[] {
    return environment.supportedLanguages;
  }
  
  private async loadTranslations(locale: string): Promise<void> {
    try {
      const translations = await import(`../../locale/messages.${locale}.json`);
      this.translations[locale] = translations.default || translations;
    } catch (error) {
      console.warn(`Could not load translations for locale: ${locale}`);
    }
  }
  
  translate(key: string, params?: { [key: string]: string }): string {
    const locale = this.getCurrentLocale();
    let translation = this.translations[locale]?.[key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  }
  
  // Get available language options for the UI
  getLanguageOptions(): { code: string; name: string; flag: string }[] {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];
  }
}
