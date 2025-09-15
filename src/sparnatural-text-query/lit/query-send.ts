import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("query-send")
export class QuerySend extends LitElement {
  @state() sending = false;

  // value comes from container (text prompt)
  @property({ type: String }) value = "";
  // href comes from container (sparnatural-services)
  @property({ type: String }) href = "";

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
    button[disabled] {
      opacity: 0.6;
      cursor: default;
    }
    button:hover {
      background-color: rgba(2, 184, 117, 0.8);
    }
  `;

  private detectNotFoundValues(queryJson: any): string[] {
    const notFoundValues: string[] = [];
    const URI_NOT_FOUND =
      "https://services.sparnatural.eu/api/v1/URI_NOT_FOUND";

    const traverse = (obj: any) => {
      if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj.values)) {
          obj.values.forEach((valueObj: any) => {
            if (
              valueObj.rdfTerm &&
              valueObj.rdfTerm.type === "uri" &&
              valueObj.rdfTerm.value === URI_NOT_FOUND &&
              valueObj.label
            ) {
              if (!notFoundValues.includes(valueObj.label)) {
                notFoundValues.push(valueObj.label);
              }
            }
          });
        }
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === "object") traverse(value);
          }
        }
      }
    };

    traverse(queryJson);
    return notFoundValues;
  }

  private buildUrl(): string {
    const base = this.href
      ? this.href.endsWith("/")
        ? this.href
        : this.href + "/"
      : "";
    return `${base}text2query?text=${encodeURIComponent(this.value || "")}`;
  }

  async send() {
    if (!this.value || !this.value.trim()) {
      this.dispatchEvent(
        new CustomEvent("query-error", {
          detail: "The input field is empty. Please enter a query.",
          bubbles: true,
          composed: true,
        })
      );
      return;
    }
    if (!this.href) {
      this.dispatchEvent(
        new CustomEvent("query-error", {
          detail: "Service href manquant",
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    this.sending = true;
    const originalValue = this.value;

    const url = this.buildUrl();
    try {
      const res = await fetch(url);

      // 204 special case
      if (res.status === 204) {
        let explanation = "The query was not understood";
        try {
          const json = await res.json();
          if (json?.metadata?.explanation)
            explanation = json.metadata.explanation;
        } catch {
          /* ignore parse error */
        }
        throw new Error(explanation);
      }

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const json = await res.json();

      // detect not found values
      const notFoundValues = this.detectNotFoundValues(json);
      if (notFoundValues.length > 0) {
        const valuesList = notFoundValues
          .map((v: string) => `"${v}"`)
          .join(", ");
        this.dispatchEvent(
          new CustomEvent("query-warning", {
            detail: `Entities not found: ${valuesList}`,
            bubbles: true,
            composed: true,
          })
        );
      }

      // metadata.explanation
      if (json.metadata && typeof json.metadata.explanation === "string") {
        this.dispatchEvent(
          new CustomEvent("query-warning", {
            detail: `IA: ${json.metadata.explanation}`,
            bubbles: true,
            composed: true,
          })
        );
      }

      // Clean query: remove metadata.explanation then dispatch load-query
      const cleanQuery = {
        ...json,
        metadata: { ...(json.metadata || {}) },
      };
      if (cleanQuery.metadata && cleanQuery.metadata.explanation) {
        delete cleanQuery.metadata.explanation;
      }

      // dispatch load-query (kebab-case) for container + bubble so outer element can react
      this.dispatchEvent(
        new CustomEvent("load-query", {
          detail: { query: cleanQuery },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err: any) {
      const message = err?.message || "Erreur inconnue";
      this.dispatchEvent(
        new CustomEvent("query-error", {
          detail: message,
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this.sending = false;
    }
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <button @click=${this.send} ?disabled=${this.sending} title="Send">
        <i
          class=${this.sending
            ? "fas fa-spinner fa-spin"
            : "fa-solid fa-arrow-up"}
        ></i>
      </button>
    `;
  }
}
