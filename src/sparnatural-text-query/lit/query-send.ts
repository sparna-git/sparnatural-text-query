import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("query-send")
export class QuerySend extends LitElement {
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
  private send() {
    this.dispatchEvent(new CustomEvent("send-query"));
  }

  render() {
    return html`
      <button @click=${this.send} id="send-button">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <i class="fa-solid fa-arrow-up" style="color: white;"></i>
      </button>
    `;
  }
}
