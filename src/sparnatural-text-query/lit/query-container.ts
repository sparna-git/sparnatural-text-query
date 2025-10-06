import { LitElement, html, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { I18n } from "../settings/i18n";
import "./query-micro";
import "./query-send";

@customElement("sparnatural-text-query")
export class QueryContainer extends LitElement {
  @property({ type: String, reflect: true }) lang: "en" | "fr" = "en";
  @state() private value = "";
  @state() private serviceHref = "";
  @state() private i18n: any = I18n.i18nLabelsResources["en"];

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
      padding: 8px 0;
      margin: 0;
      min-width: 500px;
      resize: none !important;
      min-height: 50px;
      max-height: 120px;
      height: auto;
    }

    /* Styles appliqués au <select> slotté */
    :host ::slotted(select) {
      width: 36px !important;
      height: 36px !important;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0 !important;
      font-size: 12px;
      background-color: #f8f9fa;
      color: #495057;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 36px;
      max-width: 36px;
    }

    :host ::slotted(select:hover) {
      background-color: #e9ecef;
      border-color: #adb5bd;
    }

    :host ::slotted(select:focus) {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
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
    // Initialiser I18n avec la langue courante
    I18n.init(this.lang);

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

    // brancher le slot dropdown + appliquer styles
    const dropdownSlot = this.shadowRoot!.querySelector(
      'slot[name="dropdown"]'
    ) as HTMLSlotElement;
    if (dropdownSlot) {
      dropdownSlot.addEventListener("slotchange", () => this._wireSelect());
      this._wireSelect(); // premier passage
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("lang")) {
      // Réinitialiser I18n quand la langue change
      I18n.init(this.lang);
      this.i18n =
        I18n.i18nLabelsResources[this.lang] || I18n.i18nLabelsResources["en"];
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
    // Reset la hauteur pour recalculer correctement
    textarea.style.height = "auto";

    // Calculer la nouvelle hauteur basée sur le contenu
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 120);
    textarea.style.height = newHeight + "px";
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

  private getSelect(): HTMLSelectElement | null {
    const slot = this.shadowRoot!.querySelector(
      'slot[name="dropdown"]'
    ) as HTMLSlotElement;
    if (!slot) return null;
    const assigned = slot.assignedElements({ flatten: true }) as Element[];
    const el = assigned.find((e) => e.tagName.toLowerCase() === "select") as
      | HTMLSelectElement
      | undefined;
    return el || null;
  }

  private _wireSelect() {
    const select = this.getSelect();
    if (!select) return;

    // éviter doublons
    if (!(select as any)._qcWired) {
      select.addEventListener("change", (e) => this.onSelectChange(e as Event));
      (select as any)._qcWired = true;
    }
  }

  private onInputChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.autoSize(textarea);
    this.value = textarea.value;
    this.hideMessage();
  }

  private onSelectChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const selectedValue = select.value;

    if (selectedValue) {
      this.value = selectedValue;
      const ta = this.getTextarea();
      if (ta) {
        ta.value = this.value;
        this.autoSize(ta);
      }
      this.hideMessage();

      // Reset la sélection pour permettre de re-sélectionner la même option
      select.value = "";
    }
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

          <slot name="dropdown"></slot>

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
