import { HTMLComponent } from "sparnatural";
import { ISparnaturalSpecification } from "sparnatural";

class SparnaturalServicesComponent extends HTMLComponent {
  specProvider: ISparnaturalSpecification;

  constructor() {
    super("SparnaturalServices", null, null);
    console.log("SparnaturalServicesComponent constructed");
  }

  render(): this {
    console.log("Rendering SparnaturalServicesComponent...");

    const container = document.createElement("div");
    this.html.append(container);

    return this;
  }

  public setSpecProvider(sp: ISparnaturalSpecification): void {
    this.specProvider = sp;
    console.log("SparnaturalServicesComponent: specProvider", sp);
  }
}

export default SparnaturalServicesComponent;
