// Vocabulary Manager - for managing vocabulary words that need editing

class VocabularyManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.init();
  }

  init() {
    this.populateParsingResultsTable();
    this.populateVocabTable();

    document
      .getElementById("saveParsingResultsChanges")
      .addEventListener("click", () => this.saveParsingResultsChanges());

    document
      .getElementById("saveVocabChanges")
      .addEventListener("click", () => this.saveVocabChanges());
  }

  populateParsingResultsTable() {
    const tableBody = document.getElementById("parsingResultsTableBody");
    tableBody.innerHTML = "";

    const parsingResults = this.vocabApp.parsingResults || []; // Assuming parsingResults is available

    if (parsingResults.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5">No parsing results to manage</td></tr>';
      return;
    }

    parsingResults.forEach((word) => {
      const row = document.createElement("tr");
      row.dataset.id = word.id;

      row.innerHTML = `
        <td>${word.word}</td>
        <td><input type="text" class="translation-input" value="${
          word.translation || ""
        }"></td>
        <td>
          <select class="category-select">
            ${this.vocabApp
              .getUniqueCategories()
              .map(
                (cat) =>
                  `<option value="${cat}" ${
                    cat === word.category ? "selected" : ""
                  }>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
              )
              .join("")}
          </select>
        </td>
        <td><input type="text" class="example-input" value="${
          word.example || ""
        }"></td>
        <td><button class="delete-btn" data-id="${word.id}">Delete</button></td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.vocabApp.parsingResults = this.vocabApp.parsingResults.filter(
          (word) => word.id !== id
        );
        e.target.closest("tr").remove();
      });
    });
  }

  populateVocabTable() {
    const tableBody = document.getElementById("vocabTableBody");
    tableBody.innerHTML = "";

    this.vocabApp.allCards.forEach((card) => {
      const row = document.createElement("tr");
      row.dataset.id = card.id;

      row.innerHTML = `
        <td>${card.word}</td>
        <td><input type="text" class="translation-input" value="${
          card.translation || ""
        }"></td>
        <td>
          <select class="category-select">
            ${this.vocabApp
              .getUniqueCategories()
              .map(
                (cat) =>
                  `<option value="${cat}" ${
                    cat === card.category ? "selected" : ""
                  }>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
              )
              .join("")}
          </select>
        </td>
        <td><input type="text" class="example-input" value="${
          card.example || ""
        }"></td>
        <td><button class="delete-btn" data-id="${card.id}">Delete</button></td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.vocabApp.allCards = this.vocabApp.allCards.filter(
          (card) => card.id !== id
        );
        e.target.closest("tr").remove();
        localStorage.setItem(
          "dgt-vocab-cards",
          JSON.stringify(this.vocabApp.allCards)
        );
      });
    });
  }

  saveParsingResultsChanges() {
    const rows = document.querySelectorAll(
      "#parsingResultsTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.parsingResults.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.parsingResults[wordIndex].translation = translation;
        this.vocabApp.parsingResults[wordIndex].category = category;
        this.vocabApp.parsingResults[wordIndex].example = example;
      }
    });

    localStorage.setItem(
      "dgt-vocab-parsing-results",
      JSON.stringify(this.vocabApp.parsingResults)
    );

    this.vocabApp.showMessage(
      "Parsing results updated successfully!",
      "success"
    );
  }

  saveVocabChanges() {
    const rows = document.querySelectorAll("#vocabTableBody tr[data-id]");

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const cardIndex = this.vocabApp.allCards.findIndex(
        (card) => card.id === id
      );
      if (cardIndex !== -1) {
        this.vocabApp.allCards[cardIndex].translation = translation;
        this.vocabApp.allCards[cardIndex].category = category;
        this.vocabApp.allCards[cardIndex].example = example;
      }
    });

    localStorage.setItem(
      "dgt-vocab-cards",
      JSON.stringify(this.vocabApp.allCards)
    );

    this.vocabApp.showMessage("Vocabulary updated successfully!", "success");
  }
}
