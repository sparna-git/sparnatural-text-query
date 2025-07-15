import { HTMLComponent, ISparnaturalSpecification } from "sparnatural";
import { getSettings } from "../settings/defaultSettings";
import { getSettingsServices } from "../../services/components/settings/defaultSettings";
import { SparnaturalText2QueryElement } from "../../SparnaturalText2QureyElement";
import { SparnaturalTextQueryI18n } from "../settings/SparnaturalTextQueryI18n";

class AreaTextQuery extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  lang: string;

  constructor(ParentComponent: HTMLComponent) {
    super("AreaTextQuery", ParentComponent, null);
    this.lang = getSettings().language;
  }
  public setSpecProvider(specProvider: ISparnaturalSpecification) {
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();

    const container = document.createElement("div");
    container.className = "new-query-container-mistral";

    const textareaWrapper = document.createElement("div");
    textareaWrapper.className = "voice-textarea-wrapper";

    const exampleSelect = document.createElement("select");
    exampleSelect.id = "exampleSelect";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent =
      SparnaturalTextQueryI18n.labels["select-example"];
    defaultOption.disabled = true;
    defaultOption.selected = true;
    exampleSelect.appendChild(defaultOption);

    const examples = [
      "Find all museums in France",
      "What artists were born in Algeria?",
      "List all movements where the participating artists are from Italy",
    ];

    examples.forEach((example) => {
      const option = document.createElement("option");
      option.value = example;
      option.textContent = example;
      exampleSelect.appendChild(option);
    });

    exampleSelect.onchange = () => {
      const textarea = document.getElementById(
        "naturalRequest"
      ) as HTMLTextAreaElement;
      if (textarea && exampleSelect.value) {
        textarea.value = exampleSelect.value;
        textarea.focus();
        exampleSelect.selectedIndex = 0;
      }
    };

    textareaWrapper.appendChild(exampleSelect);

    const textarea = document.createElement("textarea");
    textarea.id = "naturalRequest";
    textarea.rows = 2;
    textarea.setAttribute("data-i18n-placeholder", "Exemple");
    textarea.placeholder =
      "Ex : Donne-moi toutes les œuvres exposées en France";
    textareaWrapper.appendChild(textarea);
    // ✅ Créer le conteneur btn-send
    const btnContainer = document.createElement("div");
    btnContainer.className = "btn-send";

    // ⚠️ Message d'erreur / alerte
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.className = "message-container";
    messageContainer.setAttribute("role", "alert");
    btnContainer.appendChild(messageContainer); // ← message à gauche

    // ✅ Créer le conteneur des boutons à droite
    const actionsWrapper = document.createElement("div");
    actionsWrapper.className = "btn-actions";

    // 🎤 Bouton vocal
    const btnVoice = document.createElement("button");
    btnVoice.id = "btnVoice";
    btnVoice.setAttribute("aria-label", "Micro");
    btnVoice.onclick = this.startVoiceToQuery.bind(this);
    const micIcon = document.createElement("i");
    micIcon.id = "micIcon";
    micIcon.className = "fas fa-microphone";
    btnVoice.appendChild(micIcon);
    actionsWrapper.appendChild(btnVoice);

    // ✉️ Bouton envoyer
    const btnSend = document.createElement("button");
    btnSend.id = "btnSend";
    btnSend.setAttribute("data-i18n", "send");
    btnSend.textContent = "Envoyer";
    btnSend.onclick = this.sendNaturalRequest.bind(this);
    actionsWrapper.appendChild(btnSend);

    // ✅ Ajout du wrapper à droite dans btnContainer
    btnContainer.appendChild(actionsWrapper);

    // Injection dans le DOM
    container.appendChild(textareaWrapper);
    container.appendChild(btnContainer);

    this.html.append(container);
    return this;
  }

  private async sendNaturalRequest1(): Promise<void> {
    const prompt = (
      document.getElementById("naturalRequest") as HTMLTextAreaElement
    ).value.trim();
    const sendButton = document.getElementById("btnSend") as HTMLButtonElement;

    if (!prompt) {
      this.showErrorMessage("❌ Veuillez entrer une requête naturelle.");
      return;
    }

    // Sauvegarder le texte initial et mettre le loading spinner
    const originalText = sendButton.innerHTML;
    sendButton.disabled = true;
    sendButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    const mistralApiUrl = getSettingsServices().href;
    const url = `${mistralApiUrl}text2query?text=${encodeURIComponent(prompt)}`;
    console.log("URL de la requête :", url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const json = await res.json();

      // Check for URI_NOT_FOUND values
      const notFoundValues = this.detectNotFoundValues(json);
      if (notFoundValues.length > 0) {
        const valuesList = notFoundValues
          .map((v: string) => `"${v}"`)
          .join(", ");
        this.showWarningMessage(
          `${SparnaturalTextQueryI18n.labels["warning-1"]} ${valuesList}${SparnaturalTextQueryI18n.labels["warning-2"]}`,
          (window as any).$,
          { valuesList },
          null
        );
      } else {
        this.hideMessage();
      }

      this.loadQuery(json);
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de la requête :", err);
      this.showErrorMessage(
        "❌ Erreur lors de l'envoi de la requête : " + err.message
      );
    } finally {
      sendButton.innerHTML = originalText || "Envoyer";
      sendButton.disabled = false;
    }
  }

  private async sendNaturalRequest(): Promise<void> {
    const prompt = (
      document.getElementById("naturalRequest") as HTMLTextAreaElement
    ).value.trim();
    const sendButton = document.getElementById("btnSend") as HTMLButtonElement;

    if (!prompt) {
      this.showErrorMessage("❌ Veuillez entrer une requête naturelle.");
      return;
    }

    const originalText = sendButton.innerHTML;
    sendButton.disabled = true;
    sendButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    const mistralApiUrl = getSettingsServices().href;
    const url = `${mistralApiUrl}text2query?text=${encodeURIComponent(prompt)}`;
    console.log("URL de la requête :", url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const json = await res.json();

      // Vérifie les URI non trouvées
      const notFoundValues = this.detectNotFoundValues(json);
      const hasNotFound = notFoundValues.length > 0;
      if (hasNotFound) {
        const valuesList = notFoundValues
          .map((v: string) => `"${v}"`)
          .join(", ");
        this.showWarningMessage(
          `${SparnaturalTextQueryI18n.labels["warning-1"]} ${valuesList}${SparnaturalTextQueryI18n.labels["warning-2"]}`,
          (window as any).$,
          { valuesList },
          null
        );
      }

      // Vérifie le champ explanation dans metadata
      let hasExplanation = false;
      if (json.metadata && typeof json.metadata.explanation === "string") {
        hasExplanation = true;
        this.showWarningMessage(
          `⚠️ ${json.metadata.explanation}`,
          (window as any).$,
          { valuesList: "" },
          null
        );
      }

      // Si aucun message à afficher
      if (!hasNotFound && !hasExplanation) {
        this.hideMessage();
      }

      // Nettoyage de la requête : suppression de metadata.explanation
      const cleanQuery = {
        ...json,
        metadata: {
          ...json.metadata,
        },
      };
      if (cleanQuery.metadata && cleanQuery.metadata.explanation) {
        delete cleanQuery.metadata.explanation;
      }

      this.loadQuery(cleanQuery);
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de la requête :", err);
      this.showErrorMessage(
        "❌ Erreur lors de l'envoi de la requête : " + err.message
      );
    } finally {
      sendButton.innerHTML = originalText || "Envoyer";
      sendButton.disabled = false;
    }
  }

  private recognition: any = null;
  private isRecording: boolean = false;

  private startVoiceToQuery(): void {
    const btn = document.getElementById("btnVoice") as HTMLButtonElement;
    const icon = document.getElementById("micIcon") as HTMLElement;
    const textarea = document.getElementById(
      "naturalRequest"
    ) as HTMLTextAreaElement;

    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      this.showErrorMessage(
        "La reconnaissance vocale n'est pas prise en charge par ce navigateur. Veuillez essayer avec Chrome, Opera ou Edge."
      );
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Get language from settings
    if (this.lang === "fr") {
      this.recognition.lang = "fr-FR";
    } else {
      this.recognition.lang = "en-US";
    }
    console.log("Langue de reconnaissance :", this.recognition.lang);
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.isRecording = true;
    btn.classList.add("recording");
    icon.className = "fas fa-microphone";

    this.recognition.start();

    this.recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      textarea.value = transcript;

      btn.classList.remove("recording");
      btn.classList.add("loading");

      try {
        await this.sendNaturalRequest();
      } catch (e: any) {
        this.showErrorMessage(
          "Erreur lors de l'envoi de la requête : " + e.message
        );
      } finally {
        this.resetVoiceButtonUI();
      }
    };

    this.recognition.onerror = (event: any) => {
      this.showErrorMessage("Erreur de reconnaissance vocale : " + event.error);
      this.resetVoiceButtonUI();
    };

    this.recognition.onend = () => {
      if (this.isRecording) this.resetVoiceButtonUI();
    };
  }

  private resetVoiceButtonUI(): void {
    const btn = document.getElementById("btnVoice") as HTMLButtonElement;
    const icon = document.getElementById("micIcon") as HTMLElement;

    this.isRecording = false;
    btn.classList.remove("recording", "loading");
    icon.className = "fas fa-microphone";
  }

  private loadQuery(query: any) {
    const sparnaturalText2Query = document.querySelector(
      "sparnatural-text-query"
    ) as SparnaturalText2QueryElement;
    if (sparnaturalText2Query) {
      sparnaturalText2Query.triggerLoadQueryEvent(query);
    }
  }

  private detectNotFoundValues(queryJson: any): string[] {
    const notFoundValues: string[] = [];
    const URI_NOT_FOUND =
      "https://services.sparnatural.eu/api/v1/URI_NOT_FOUND";

    // Recursive function to traverse the JSON object
    const traverse = (obj: any) => {
      if (typeof obj === "object" && obj !== null) {
        // Check if this object has a values array (like in the branches structure)
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

        // Continue traversing all properties
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Recursively traverse nested objects and arrays
            if (typeof value === "object") {
              traverse(value);
            }
          }
        }
      }
    };

    traverse(queryJson);
    return notFoundValues;
  }

  private showWarningMessage(
    message: string,
    $: JQueryStatic,
    p0: { valuesList: string },
    p1: any
  ): void {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="warning-message">${message}</div>`;
      messageContainer.style.display = "block";
    }
  }

  private showErrorMessage(message: string): void {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="error-message">${message}</div>`;
      messageContainer.style.display = "block";
    }
  }

  private hideMessage(): void {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.style.display = "none";
      messageContainer.innerHTML = "";
    }
  }
}

export default AreaTextQuery;
