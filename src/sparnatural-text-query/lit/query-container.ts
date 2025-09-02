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

    .message-container {
      display: block;
      margin-top: 10px;
    }

    .warning-message,
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      width: fit-content;
    }

    .warning-message {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }

    .error-message {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
  `;

  private onInputChange(e: CustomEvent) {
    this.value = e.detail;
  }

  private onOptionSelected(e: CustomEvent) {
    this.value = e.detail;
  }

  private onMicToggle(e: CustomEvent) {
    console.log("Mic toggled:", e.detail);
  }

  private onSend() {
    console.log("Send query:", this.value);
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
        <query-dropdown
          .options=${[
            this.lang === "fr" ? "Exemple A" : "Example A",
            this.lang === "fr" ? "Exemple B" : "Example B",
          ]}
          @option-selected=${this.onOptionSelected}
        ></query-dropdown>
        <query-microphone @mic-toggle=${this.onMicToggle}></query-microphone>
        <query-send @send-query=${this.onSend}></query-send>
      </div>
      <div class="message-container"></div>
    `;
  }
}
