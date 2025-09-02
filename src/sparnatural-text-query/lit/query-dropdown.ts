import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("query-dropdown")
export class QueryDropdown extends LitElement {
  @property({ type: Array }) options: string[] = [];
  @state() private open = false;

  static styles = css`
    .dropdown {
      position: relative;
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

    .list {
      position: absolute;
      bottom: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 4px;
    }

    .item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      line-height: 1.4;
      transition: background-color 0.2s;
    }

    .item:hover {
      background-color: #f8f9fa;
    }

    .item:last-child {
      border-bottom: none;
    }
  `;

  private toggle() {
    this.open = !this.open;
  }

  private selectOption(opt: string) {
    this.dispatchEvent(new CustomEvent("option-selected", { detail: opt }));
    this.open = false;
  }

  render() {
    return html`
      <div class="dropdown">
        <button @click=${this.toggle}><i class="fas fa-list"></i></button>
        ${this.open
          ? html`
              <div class="list">
                ${this.options.map(
                  (opt) =>
                    html`<div
                      class="item"
                      @click=${() => this.selectOption(opt)}
                    >
                      ${opt}
                    </div>`
                )}
              </div>
            `
          : null}
      </div>
    `;
  }
}
