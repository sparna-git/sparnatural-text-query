import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("query-send")
export class QuerySend extends LitElement {
  @state() sending = false;

  @property({ type: String }) value = "";
  static styles = css`
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
      background-color: rgb(2, 184, 117);
      color: white;
    }

    button:hover {
      background-color: rgba(2, 184, 117, 0.8);
    }
  `;

  private async send() {
    if (!this.value) return;
    this.sending = true;

    // Simule fetch
    await new Promise((r) => setTimeout(r, 1000));

    this.dispatchEvent(new CustomEvent("send-query", { detail: this.value }));
    this.sending = false;
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <button @click=${this.send}>
        <i
          class=${this.sending
            ? "fas fa-spinner fa-spin"
            : "fa-solid fa-arrow-up"}
        ></i>
      </button>
    `;
  }
}
