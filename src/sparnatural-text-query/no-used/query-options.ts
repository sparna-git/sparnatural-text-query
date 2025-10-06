import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("query-options")
export class QueryOptions extends LitElement {
  @property({ type: Array }) options: string[] = [];

  static styles = css`
    .dropdown-container {
      position: relative;
      display: inline-block;
    }

    button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 16px;
      background-color: #f8f9fa;
      color: #495057;
    }

    button:hover {
      background-color: #e9ecef;
    }

    select {
      position: absolute;
      top: 0;
      left: 0;
      width: 36px;
      height: 36px;
      opacity: 0;
      cursor: pointer;
      appearance: none;
    }
  `;

  private handleSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;

    if (selectedValue) {
      this.dispatchEvent(
        new CustomEvent("option-selected", {
          detail: selectedValue,
          bubbles: true,
          composed: true,
        })
      );
      // Reset la sélection pour permettre de re-sélectionner la même option
      select.value = "";
    }
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div class="dropdown-container">
        <button><i class="fas fa-list"></i></button>
        <select @change=${this.handleSelectChange}>
          <option value="">Choisir...</option>
          ${this.options.map(
            (opt) => html`<option value="${opt}">${opt}</option>`
          )}
        </select>
      </div>
    `;
  }
}
