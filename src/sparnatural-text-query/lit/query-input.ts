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
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }

    textarea::placeholder {
      color: #999;
    }
  `;

  private onInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    this.value = textarea.value;
    this.dispatchEvent(new CustomEvent("input-change", { detail: this.value }));
  }

  render() {
    return html`
      <textarea
        rows="1"
        @input=${this.onInput}
        placeholder="Tape ta requête..."
      ></textarea>
    `;
  }
}
