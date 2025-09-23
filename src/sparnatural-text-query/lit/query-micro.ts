import { LitElement, html, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";

@customElement("query-microphone")
export class QueryMicrophone extends LitElement {
  @property({ type: String }) lang: "fr" | "en" = "fr";

  @state() private recording = false;
  private recognition: any = null;

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

  connectedCallback() {
    super.connectedCallback();
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setRecognitionLang(); // Set initial language
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        this.dispatchEvent(new CustomEvent("mic-result", { detail: text }));
        this.recording = false;
      };

      this.recognition.onerror = () => {
        this.recording = false;
      };
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("lang") && this.recognition) {
      this.setRecognitionLang();
    }
  }

  private setRecognitionLang() {
    this.recognition.lang = this.lang === "fr" ? "fr-FR" : "en-US";
    console.log("Micro lang set to:", this.recognition.lang);
  }

  private toggleRecording() {
    if (!this.recognition) return;
    if (!this.recording) {
      this.recording = true;
      this.recognition.start();
    } else {
      this.recording = false;
      this.recognition.stop();
    }
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <button @click=${this.toggleRecording}>
        <i
          class=${this.recording
            ? "fa-solid fa-microphone recording"
            : "fa-solid fa-microphone"}
        ></i>
      </button>
    `;
  }
}
