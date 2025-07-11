import { HTMLComponent } from "sparnatural";
import { ISparnaturalSpecification } from "sparnatural";
import { SparnaturalText2QueryElement } from "../../SparnaturalText2QureyElement";
import AreaTextQuery from "./AreaTextQuery";
import { getSettings } from "../settings/defaultSettings";
import { SparnaturalTextQueryI18n } from "../settings/SparnaturalTextQueryI18n";

class SparnaturalText2QueryComponent extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  areaTextQuery: AreaTextQuery;

  constructor() {
    super("SparnaturalText2QueryComponent", null, null);
    console.log("SparnaturalText2QueryComponent constructor");
  }

  render(): this {
    this.#initLang();
    console.log("Rendering SparnaturalText2QueryComponent...");
    this.areaTextQuery = new AreaTextQuery(this).render();
    return this;
  }

  /**
   * Sets the specification provider and initializes the history section.
   * Should be called externally (e.g., in plugin binding code).
   */
  public setSpecProvider(sp: ISparnaturalSpecification): void {
    this.specProvider = sp;
    console.log("SparnaturalHistoryComponent: specProvider", sp);

    this.areaTextQuery.setSpecProvider(sp);

    // Dispatch INIT event to signal other components
    this.html[0].dispatchEvent(
      new CustomEvent(SparnaturalText2QueryElement.EVENT_INIT, {
        bubbles: true,
        detail: { sparnaturalText2Query: this },
      })
    );
  }

  #initLang() {
    const lang = getSettings().language;
    if (lang === "fr") {
      SparnaturalTextQueryI18n.init("fr");
    } else {
      SparnaturalTextQueryI18n.init("en");
    }
  }
}

export default SparnaturalText2QueryComponent;
