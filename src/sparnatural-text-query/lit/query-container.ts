import { LitElement, html, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { pickI18n, I18n } from "../settings/i18n";
import "./query-options";
import "./query-micro";
import "./query-send";

@customElement("query-container")
export class QueryContainer extends LitElement {
  @property({ type: String, reflect: true }) lang: "en" | "fr" = "en";
  @state() private value = "";
  @state() private serviceHref = "";
  @state() private i18n: I18n = pickI18n("en");

  private _serviceAttrObserver: MutationObserver | null = null;

  static styles = css`
    :host {
      display: block;
      max-width: 700px;
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

    /* Styles appliqués au <textarea> slotté */
    :host ::slotted(textarea) {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      font-family: inherit;
      overflow: hidden;
      background: transparent;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      min-width: 500px;
      resize: none !important;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
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
    // brancher listeners warning/error
    this.addEventListener("query-warning", (e: any) => {
      const msg = String(e.detail).trim();
      if (msg) this.showWarningMessage(msg);
    });
    this.addEventListener("query-error", (e: any) => {
      const msg = String(e.detail).trim();
      if (msg) this.showErrorMessage(msg);
    });

    // brancher le slot input + appliquer styles inline critiques (resize)
    const slot = this.shadowRoot!.querySelector(
      'slot[name="input"]'
    ) as HTMLSlotElement;
    if (slot) {
      slot.addEventListener("slotchange", () => this._wireTextarea());
      this._wireTextarea(); // premier passage
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("lang")) {
      this.i18n = pickI18n(this.lang);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._serviceAttrObserver) {
      this._serviceAttrObserver.disconnect();
      this._serviceAttrObserver = null;
    }
  }

  private getTextarea(): HTMLTextAreaElement | null {
    const slot = this.shadowRoot!.querySelector(
      'slot[name="input"]'
    ) as HTMLSlotElement;
    if (!slot) return null;
    const assigned = slot.assignedElements({ flatten: true }) as Element[];
    const el = assigned.find((e) => e.tagName.toLowerCase() === "textarea") as
      | HTMLTextAreaElement
      | undefined;
    return el || null;
  }

  private _wireTextarea() {
    const ta = this.getTextarea();
    if (!ta) return;

    // éviter doublons
    if (!(ta as any)._qcWired) {
      ta.addEventListener("input", (e) => this.onInputChange(e as Event));
      (ta as any)._qcWired = true;
    }

    // 🔒 Forcer "resize: none" en inline (bat bootstrap et co)
    ta.style.setProperty("resize", "none", "important");
    //
    ta.style.setProperty("border", "none", "important"); // cohérence visuelle
    // cohérence visuelle
    ta.style.overflow = "hidden";

    // autosize initial si valeur présente
    this.autoSize(ta);
  }

  private autoSize(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  private syncServiceHref() {
    const serviceEl = this.querySelector(
      "sparnatural-services"
    ) as HTMLElement | null;
    const href = serviceEl?.getAttribute("href") || "";
    if (href !== this.serviceHref) this.serviceHref = href;

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

  private onInputChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.autoSize(textarea);
    this.value = textarea.value;
    this.hideMessage();
  }

  private onOptionSelected(e: CustomEvent) {
    this.value = e.detail;
    const ta = this.getTextarea();
    if (ta) {
      ta.value = this.value;
      this.autoSize(ta);
    }
    this.hideMessage();
  }

  private onMicToggle = (e: CustomEvent) => {
    this.value = e.detail;
    const ta = this.getTextarea();
    if (ta) {
      ta.value = this.value;
      this.autoSize(ta);
    }
    this.hideMessage();
  };

  private onLoadQueryFromSend(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent("loadQuery", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

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
        <!-- textarea natif slotté -->
        <slot name="input" id="input-slot"></slot>

        <div class="controls">
          <slot
            name="services"
            @slotchange=${() => this.syncServiceHref()}
          ></slot>
          <slot
            name="dropdown"
            @option-selected=${(e: CustomEvent) => this.onOptionSelected(e)}
          ></slot>

          <query-microphone
            .lang=${this.lang}
            @mic-result=${this.onMicToggle}
          ></query-microphone>

          <query-send
            .value=${this.value}
            .href=${this.serviceHref}
            .i18n=${this.i18n}
            @load-query=${this.onLoadQueryFromSend}
            @query-warning=${(e: CustomEvent) =>
              this.showWarningMessage(String(e.detail))}
            @query-error=${(e: CustomEvent) =>
              this.showErrorMessage(String(e.detail))}
          ></query-send>
        </div>
      </div>

      <div class="message-container"></div>
    `;
  }
}
