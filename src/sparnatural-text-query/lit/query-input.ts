import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("query-input")
export class QueryInput extends LitElement {
  @property({ type: String }) value: string = "";
  @property({ type: String }) placeholder: string = "Type your query...";

  static styles = css`
    textarea {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      font-family: inherit;
      resize: none;
      overflow: hidden;
      background: transparent;
      min-height: 24px;
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }

    textarea::placeholder {
      color: #999;
    }
  `;

  private onInput(e: Event) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.dispatchEvent(new CustomEvent("input-change", { detail: this.value }));
  }

  render() {
    return html`
      <textarea
        .value=${this.value}
        rows="1"
        placeholder=${this.placeholder}
        @input=${this.onInput}
      ></textarea>
    `;
  }
}
