import "../scss/sparnatural-text-query.scss";
import SparnaturalText2QueryComponent from "./sparnatural-text-query/component/SparnaturalText2QueryComponent";
import { SparnaturalText2QueryAttributes } from "./SparnaturalText2QureyAttributes";
import { SparnaturalQueryIfc } from "sparnatural";
import {
  getSettings,
  mergeSettings,
} from "./sparnatural-text-query/settings/defaultSettings";
import { mergeSettingsServices } from "../src/services/components/settings/defaultSettings";

export class SparnaturalText2QueryElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-text-query";
  static EVENT_INIT = "init";
  static EVENT_LOAD_QUERY = "loadQuery";

  _attributes: SparnaturalText2QueryAttributes;

  sparnaturalText2Query: SparnaturalText2QueryComponent;

  constructor() {
    super();
    console.log("SparnaturalText2QueryElement constructor");
  }

  connectedCallback() {
    console.log("SparnaturalText2QueryElement connected to the DOM");
    this.display();
  }

  display() {
    console.log("Displaying SparnaturalText2QueryElement...");

    const servicesElement = this.querySelector("sparnatural-services");
    let mistralUrl = "";
    if (servicesElement) {
      mistralUrl = servicesElement.getAttribute("href") || "";
    } else {
      console.warn(
        "⚠️ <sparnatural-services> introuvable dans <sparnatural-history>"
      );
    }

    this._attributes = new SparnaturalText2QueryAttributes(this);
    mergeSettings({ ...this._attributes });
    mergeSettingsServices({ ...this._attributes, href: mistralUrl });

    this.sparnaturalText2Query = new SparnaturalText2QueryComponent();

    // Supprime tout sauf <sparnatural-services> (pour ne pas perdre le service)
    [...this.children].forEach((child) => {
      if (child.tagName.toLowerCase() !== "sparnatural-services") {
        child.remove();
      }
    });

    // Ajoute le composant SparnaturalText2QueryComponent
    this.appendChild(this.sparnaturalText2Query.html.get(0));

    this.sparnaturalText2Query.render();
  }

  static get observedAttributes() {
    return ["lang"];
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) return;

    if (oldValue != null) {
      switch (name) {
        case "lang":
          getSettings().language = newValue;
          break;
        default:
          throw new Error(`unknown observed attribute ${name}`);
      }
      this.display();
    }
  }

  notifyConfiguration(config: any): void {
    this.sparnaturalText2Query.setSpecProvider(config);
  }

  triggerLoadQueryEvent(query: SparnaturalQueryIfc) {
    // Dispatch LOAD_QUERY event
    this.dispatchEvent(
      new CustomEvent(SparnaturalText2QueryElement.EVENT_LOAD_QUERY, {
        bubbles: true,
        detail: { query: query },
      })
    );
  }
}

customElements.get(SparnaturalText2QueryElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalText2QueryElement.HTML_ELEMENT_NAME,
    SparnaturalText2QueryElement
  );
