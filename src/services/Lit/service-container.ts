import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// TypeScript interface pour tes settings
interface ISettings {
  href: string;
}

// Valeurs par défaut
const defaultSettings: ISettings = {
  href: "",
};

@customElement("sparnatural-services")
export class SparnaturalServices extends LitElement {
  // --- ATTRIBUTES ---
  @property({ type: String }) href: string = "";

  // --- INTERNAL STATE ---
  @state() private settings: ISettings = { ...defaultSettings };

  static styles = css`
    :host {
      display: block;
    }
  `;

  constructor() {
    super();
    console.log("SparnaturalServices (Lit) constructed");
  }

  connectedCallback() {
    super.connectedCallback();
    console.log("SparnaturalServices (Lit) connected to DOM");
    this.updateSettings();
  }

  // Observe href pour mettre à jour le state
  updated(changedProps: Map<string, any>) {
    if (changedProps.has("href")) {
      this.updateSettings();
    }
  }

  private updateSettings() {
    this.settings = { ...defaultSettings, href: this.href };
    console.log("Updated settings:", this.settings);
  }

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}
