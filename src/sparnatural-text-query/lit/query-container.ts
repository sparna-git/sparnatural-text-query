import { LitElement, html, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import "./query-input";
import "./query-dropdown";
import "./query-micro";
import "./query-send";

@customElement("query-container")
export class QueryContainer extends LitElement {
  @property({ type: String }) lang = "en";
  @state() private value = "";
  @state() private serviceHref = "";

  private _serviceAttrObserver: MutationObserver | null = null;

  static styles = css`
    :host {
      display: block;
      max-width: 900px;
      margin: 0 auto auto;
      font-family: sans-serif;
      background: rgba(29, 224, 153, 0.1);
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
    }
    .container {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 4px;
      gap: 6px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto; /* pousse tout le bloc à droite */
    }
    .message-container {
      display: block;
      margin-top: 10px;
    }
    .warning-message {
      background: #fff3cd;
      padding: 10px;
      border-radius: 6px;
      color: #856404;
    }
    .error-message {
      background: #f8d7da;
      padding: 10px;
      border-radius: 6px;
      color: #721c24;
    }
  `;

  firstUpdated() {
    // sync now and when slot changes
    const slot = this.renderRoot.querySelector(
      'slot[name="services"]'
    ) as HTMLSlotElement | null;
    this.syncServiceHref();
    slot?.addEventListener("slotchange", () => this.syncServiceHref());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._serviceAttrObserver) {
      this._serviceAttrObserver.disconnect();
      this._serviceAttrObserver = null;
    }
  }

  private syncServiceHref() {
    // The <sparnatural-services> is a light DOM child assigned to the slot,
    // so querySelector on this (light DOM) finds it.
    const serviceEl = this.querySelector(
      "sparnatural-services"
    ) as HTMLElement | null;
    const href = serviceEl?.getAttribute("href") || "";
    if (href !== this.serviceHref) {
      this.serviceHref = href;
    }

    // Observe attribute changes on the service element (so dynamic changes update the button)
    if (this._serviceAttrObserver) {
      this._serviceAttrObserver.disconnect();
      this._serviceAttrObserver = null;
    }
    if (serviceEl) {
      this._serviceAttrObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && (m as any).attributeName === "href") {
            const newHref =
              (m.target as HTMLElement).getAttribute("href") || "";
            if (newHref !== this.serviceHref) this.serviceHref = newHref;
          }
        }
      });
      this._serviceAttrObserver.observe(serviceEl, {
        attributes: true,
        attributeFilter: ["href"],
      });
    }
  }

  private onInputChange(e: CustomEvent) {
    this.value = e.detail;
  }

  private onOptionSelected(e: CustomEvent) {
    this.value = e.detail;
  }

  private onMicToggle(e: CustomEvent) {
    this.value = e.detail; // if mic returns text via event
  }

  // events from query-send
  private onLoadQueryFromSend(e: CustomEvent) {
    // bubble the event as 'loadQuery' (camelCase) for compatibility with old code
    const detail = e.detail;
    this.dispatchEvent(
      new CustomEvent("loadQuery", { detail, bubbles: true, composed: true })
    );
    // also clear messages
    this.hideMessage();
  }

  private onQueryWarning(e: CustomEvent) {
    this.showWarningMessage(String(e.detail));
  }

  private onQueryError(e: CustomEvent) {
    this.showErrorMessage(String(e.detail));
  }

  // simple message UI
  private showWarningMessage(msg: string) {
    const container = this.renderRoot.querySelector(
      ".message-container"
    ) as HTMLElement;
    if (container)
      container.innerHTML = `<div class="warning-message">${msg}</div>`;
  }
  private showErrorMessage(msg: string) {
    const container = this.renderRoot.querySelector(
      ".message-container"
    ) as HTMLElement;
    if (container)
      container.innerHTML = `<div class="error-message">${msg}</div>`;
  }
  private hideMessage() {
    const container = this.renderRoot.querySelector(
      ".message-container"
    ) as HTMLElement;
    if (container) container.innerHTML = "";
  }

  render() {
    return html`
      <div class="container">
        <query-input
          .value=${this.value}
          placeholder=${this.lang === "fr"
            ? "Ex : Donne-moi toutes les œuvres exposées en France"
            : "Ex: Give me all the artworks exhibited in France"}
          @input-change=${this.onInputChange}
        ></query-input>

        <div class="controls">
          <query-dropdown
            .options=${[
              this.lang === "fr" ? "Exemple A" : "Example A",
              this.lang === "fr" ? "Exemple B" : "Example B",
            ]}
            @option-selected=${this.onOptionSelected}
          ></query-dropdown>

          <query-microphone @voice-input=${this.onMicToggle}></query-microphone>

          <!-- slot where user places <sparnatural-services slot="services" href="..."> -->
          <slot name="services"></slot>

          <!-- pass value and the service href to the button; listen events from it -->
          <query-send
            .value=${this.value}
            .href=${this.serviceHref}
            @load-query=${(e: CustomEvent) => this.onLoadQueryFromSend(e)}
            @query-warning=${(e: CustomEvent) => this.onQueryWarning(e)}
            @query-error=${(e: CustomEvent) => this.onQueryError(e)}
          ></query-send>
        </div>
      </div>

      <div class="message-container"></div>
    `;
  }
}
