// will using the same class I18 or a new class I18History and same thing for labels on assests lang ?

export class SparnaturalTextQueryI18n {
  static i18nLabelsResources: any = {
    en: require("../lang/en.json"),
    fr: require("../lang/fr.json"),
  };

  public static labels: any;

  private constructor() {}

  static init(lang: any) {
    SparnaturalTextQueryI18n.labels =
      SparnaturalTextQueryI18n.i18nLabelsResources[lang];
  }
}
