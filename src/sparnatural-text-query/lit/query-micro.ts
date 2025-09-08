import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("query-microphone")
export class QueryMicrophone extends LitElement {
  @state() private recording = false;

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
      background-color: #f8f9fa;
      color: #495057;
    }

    button:hover {
      background-color: #e9ecef;
    }

    .recording {
      color: rgb(72, 206, 152);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.6;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;

  private toggle() {
    this.recording = !this.recording;
    this.dispatchEvent(
      new CustomEvent("mic-toggle", { detail: this.recording })
    );
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <button @click=${this.toggle}>
        <i
          class=${this.recording
            ? "fas fa-microphone recording"
            : "fas fa-microphone"}
        ></i>
      </button>
    `;
  }
}
