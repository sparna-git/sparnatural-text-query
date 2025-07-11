export class SparnaturalText2QueryAttributes {
  language: string;

  constructor(element: HTMLElement) {
    this.language = this.#read(element, "lang");
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }
}
