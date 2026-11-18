'use strict';

/* =========================================================
   Translations. To add a language: add it to LANGS and I18N.
   Missing keys fall back to English.
   ========================================================= */

const LANGS = { de: 'Deutsch', en: 'English', fr: 'Français', it: 'Italiano' };

const I18N = {
  de: {
    'menu.file': 'Datei', 'menu.edit': 'Bearbeiten', 'menu.help': 'Hilfe',
    'action.new': 'Neues Projekt', 'action.open': 'Projekt/Datei öffnen', 'action.save': 'Download',
    'action.code': 'Code exportieren', 'action.image': 'Bild erstellen',
    'action.undo': 'Rückgängig', 'action.redo': 'Wiederholen', 'action.delete': 'Element löschen',
    'action.info': 'Info', 'key.delete': 'Entf',
    'language': 'Sprache',
    'tab.add': 'Neues Struktogramm', 'tab.rename': 'Doppelklick zum Umbenennen', 'tab.delete': '"{name}" löschen',
    'palette.loops': 'Schleifen', 'palette.decisions': 'Entscheidungen', 'palette.other': 'Weitere Elemente',
    'sidebar.collapse': 'Menu verkleinern',
    'start.new': 'Neues Projekt erstellen:', 'start.title': 'Projekttitel', 'start.create': 'Projekt erstellen',
    'start.open': 'Projekt aus Datei öffnen:', 'start.choose': 'Datei auswählen…',
    'start.last': 'Zuletzt bearbeitetes Projekt laden',
    'common.cancel': 'Abbrechen', 'common.delete': 'Löschen', 'common.remove': 'Entfernen', 'common.close': 'Schliessen',
    'branch.true': 'wahr', 'branch.false': 'falsch',
    'case.default': 'sonst', 'case.placeholder': 'Fall {n}', 'case.heading': 'Fälle (der letzte ist der Standardfall)',
    'case.remove': 'Fall entfernen', 'case.add': '+ Fall hinzufügen',
    'case.removeAsk': 'Fall "{label}" mit {n} Element(en) entfernen?',
    'diagram.main': 'Hauptstruktogramm', 'diagram.function': 'Funktion {n}', 'project.default': 'Struktogramm',
    'ask.diagramName': 'Name des Struktogramms', 'ask.functionName': 'Name der Funktion', 'ask.deleteDiagram': '"{name}" löschen?',
    'msg.title': 'Hinweis', 'msg.badFile': 'Diese Datei konnte nicht gelesen werden.',
    'msg.imageFailed': 'Bildexport konnte nicht geladen werden.', 'msg.lastFailed': 'Das letzte Projekt konnte nicht geladen werden.',
    'code.copy': 'Kopieren', 'code.copied': 'Kopiert ✓',
    'info.title': 'Information', 'info.example': 'Code Beispiel:', 'info.insert': 'Einfügen',
    'info.tip': 'Tipp: Element in das Struktogramm ziehen – oder hier einfügen (nach dem ausgewählten Element, sonst am Ende).',
    'help.title': 'Info', 'help.intro': '<b>Structorizer v2</b> – Struktogramme (Nassi-Shneiderman-Diagramme) im Browser erstellen.',
    'help.drag': 'Elemente aus der linken Leiste in das Struktogramm <b>ziehen</b>.',
    'help.select': 'Element anklicken zum Auswählen, <b>Doppelklick</b> zum Bearbeiten des Textes.',
    'help.move': 'Bestehende Elemente können per Drag &amp; Drop verschoben werden.',
    'help.keys': '<kbd>Entf</kbd> löscht das ausgewählte Element, <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> für Rückgängig / Wiederholen.',
    'help.tabs': 'Mit <b>+</b> in der Tableiste weitere Struktogramme (Funktionen) anlegen.',
    'help.save': 'Das Projekt wird automatisch im Browser gespeichert. Über <i>Datei → Download</i> kann es als Datei gesichert werden.',
    'help.old': 'Alte Version öffnen',
    'el.while.name': 'While-Schleife', 'el.while.text': 'Bedingung',
    'el.while.info': 'Eine While-Schleife wird so lange ausgeführt, wie die Bedingung zutrifft. Die Bedingung wird vor jedem Durchlauf geprüft.',
    'el.dowhile.name': 'DoWhile-Schleife', 'el.dowhile.text': 'Bedingung',
    'el.dowhile.info': 'Eine DoWhile-Schleife wird mindestens einmal ausgeführt. Die Bedingung wird erst nach jedem Durchlauf geprüft.',
    'el.for.name': 'For-Schleife', 'el.for.text': 'i = 1 bis 10',
    'el.for.info': 'Eine For-Schleife (Zählschleife) wird eine festgelegte Anzahl Male ausgeführt.',
    'el.if.name': 'If-Abfrage', 'el.if.text': 'Bedingung',
    'el.if.info': 'Trifft die Bedingung zu, wird der linke (wahr) Zweig ausgeführt, sonst der rechte (falsch).',
    'el.switch.name': 'Mehrfachauswahl', 'el.switch.text': 'Variable',
    'el.switch.info': 'Abhängig vom Wert einer Variable wird einer von mehreren Fällen ausgeführt. Der letzte Fall ist der Standardfall (sonst).',
    'el.instruction.name': 'Anweisung', 'el.instruction.text': 'Anweisung',
    'el.instruction.info': 'Eine einfache Anweisung, z.B. eine Zuweisung, Eingabe oder Ausgabe.',
    'el.call.name': 'Funktion', 'el.call.text': 'funktion()',
    'el.call.info': 'Ruft eine Funktion (Unterprogramm) auf. Weitere Struktogramme können über das "+" in der Tableiste erstellt werden.',
    'field.while': 'Bedingung', 'field.dowhile': 'Bedingung', 'field.for': 'Zählbereich', 'field.if': 'Bedingung',
    'field.switch': 'Ausdruck', 'field.instruction': 'Anweisung', 'field.call': 'Funktionsaufruf',
  },

  en: {
    'menu.file': 'File', 'menu.edit': 'Edit', 'menu.help': 'Help',
    'action.new': 'New project', 'action.open': 'Open project/file', 'action.save': 'Download',
    'action.code': 'Export code', 'action.image': 'Create image',
    'action.undo': 'Undo', 'action.redo': 'Redo', 'action.delete': 'Delete element',
    'action.info': 'About', 'key.delete': 'Del',
    'language': 'Language',
    'tab.add': 'New diagram', 'tab.rename': 'Double-click to rename', 'tab.delete': 'Delete "{name}"',
    'palette.loops': 'Loops', 'palette.decisions': 'Decisions', 'palette.other': 'Other elements',
    'sidebar.collapse': 'Collapse menu',
    'start.new': 'Create a new project:', 'start.title': 'Project title', 'start.create': 'Create project',
    'start.open': 'Open a project from a file:', 'start.choose': 'Choose file…',
    'start.last': 'Load last edited project',
    'common.cancel': 'Cancel', 'common.delete': 'Delete', 'common.remove': 'Remove', 'common.close': 'Close',
    'branch.true': 'true', 'branch.false': 'false',
    'case.default': 'otherwise', 'case.placeholder': 'Case {n}', 'case.heading': 'Cases (the last one is the default)',
    'case.remove': 'Remove case', 'case.add': '+ Add case',
    'case.removeAsk': 'Remove case "{label}" with {n} element(s)?',
    'diagram.main': 'Main diagram', 'diagram.function': 'Function {n}', 'project.default': 'Structogram',
    'ask.diagramName': 'Diagram name', 'ask.functionName': 'Function name', 'ask.deleteDiagram': 'Delete "{name}"?',
    'msg.title': 'Notice', 'msg.badFile': 'This file could not be read.',
    'msg.imageFailed': 'Image export could not be loaded.', 'msg.lastFailed': 'The last project could not be loaded.',
    'code.copy': 'Copy', 'code.copied': 'Copied ✓',
    'info.title': 'Information', 'info.example': 'Code example:', 'info.insert': 'Insert',
    'info.tip': 'Tip: drag the element into the diagram – or insert it here (after the selected element, otherwise at the end).',
    'help.title': 'About', 'help.intro': '<b>Structorizer v2</b> – create structograms (Nassi-Shneiderman diagrams) in your browser.',
    'help.drag': '<b>Drag</b> elements from the left sidebar into the diagram.',
    'help.select': 'Click an element to select it, <b>double-click</b> to edit its text.',
    'help.move': 'Existing elements can be moved by drag &amp; drop.',
    'help.keys': '<kbd>Del</kbd> deletes the selected element, <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> undo / redo.',
    'help.tabs': 'Use <b>+</b> in the tab bar to add more diagrams (functions).',
    'help.save': 'Your project is saved automatically in the browser. Use <i>File → Download</i> to keep a copy as a file.',
    'help.old': 'Open the old version',
    'el.while.name': 'While loop', 'el.while.text': 'Condition',
    'el.while.info': 'A while loop runs as long as its condition is true. The condition is checked before each pass.',
    'el.dowhile.name': 'Do-while loop', 'el.dowhile.text': 'Condition',
    'el.dowhile.info': 'A do-while loop runs at least once. The condition is checked after each pass.',
    'el.for.name': 'For loop', 'el.for.text': 'i = 1 to 10',
    'el.for.info': 'A for loop (counting loop) runs a fixed number of times.',
    'el.if.name': 'If statement', 'el.if.text': 'Condition',
    'el.if.info': 'If the condition is true, the left (true) branch runs, otherwise the right (false) branch.',
    'el.switch.name': 'Multiple choice', 'el.switch.text': 'Variable',
    'el.switch.info': 'One of several cases runs depending on the value of a variable. The last case is the default (otherwise).',
    'el.instruction.name': 'Statement', 'el.instruction.text': 'Statement',
    'el.instruction.info': 'A simple statement, such as an assignment, input or output.',
    'el.call.name': 'Function', 'el.call.text': 'function()',
    'el.call.info': 'Calls a function (subroutine). More diagrams can be added with the "+" in the tab bar.',
    'field.while': 'Condition', 'field.dowhile': 'Condition', 'field.for': 'Range', 'field.if': 'Condition',
    'field.switch': 'Expression', 'field.instruction': 'Statement', 'field.call': 'Function call',
  },

  fr: {
    'menu.file': 'Fichier', 'menu.edit': 'Édition', 'menu.help': 'Aide',
    'action.new': 'Nouveau projet', 'action.open': 'Ouvrir un projet/fichier', 'action.save': 'Télécharger',
    'action.code': 'Exporter le code', 'action.image': 'Créer une image',
    'action.undo': 'Annuler', 'action.redo': 'Rétablir', 'action.delete': "Supprimer l'élément",
    'action.info': 'À propos', 'key.delete': 'Suppr',
    'language': 'Langue',
    'tab.add': 'Nouveau structogramme', 'tab.rename': 'Double-cliquer pour renommer', 'tab.delete': 'Supprimer « {name} »',
    'palette.loops': 'Boucles', 'palette.decisions': 'Décisions', 'palette.other': 'Autres éléments',
    'sidebar.collapse': 'Réduire le menu',
    'start.new': 'Créer un nouveau projet :', 'start.title': 'Titre du projet', 'start.create': 'Créer le projet',
    'start.open': 'Ouvrir un projet depuis un fichier :', 'start.choose': 'Choisir un fichier…',
    'start.last': 'Charger le dernier projet modifié',
    'common.cancel': 'Annuler', 'common.delete': 'Supprimer', 'common.remove': 'Retirer', 'common.close': 'Fermer',
    'branch.true': 'vrai', 'branch.false': 'faux',
    'case.default': 'sinon', 'case.placeholder': 'Cas {n}', 'case.heading': 'Cas (le dernier est le cas par défaut)',
    'case.remove': 'Retirer le cas', 'case.add': '+ Ajouter un cas',
    'case.removeAsk': 'Retirer le cas « {label} » avec {n} élément(s) ?',
    'diagram.main': 'Structogramme principal', 'diagram.function': 'Fonction {n}', 'project.default': 'Structogramme',
    'ask.diagramName': 'Nom du structogramme', 'ask.functionName': 'Nom de la fonction', 'ask.deleteDiagram': 'Supprimer « {name} » ?',
    'msg.title': 'Remarque', 'msg.badFile': "Ce fichier n'a pas pu être lu.",
    'msg.imageFailed': "L'export d'image n'a pas pu être chargé.", 'msg.lastFailed': "Le dernier projet n'a pas pu être chargé.",
    'code.copy': 'Copier', 'code.copied': 'Copié ✓',
    'info.title': 'Information', 'info.example': 'Exemple de code :', 'info.insert': 'Insérer',
    'info.tip': "Astuce : faites glisser l'élément dans le structogramme, ou insérez-le ici (après l'élément sélectionné, sinon à la fin).",
    'help.title': 'À propos', 'help.intro': '<b>Structorizer v2</b> – créez des structogrammes (diagrammes de Nassi-Shneiderman) dans votre navigateur.',
    'help.drag': '<b>Faites glisser</b> les éléments de la barre de gauche dans le structogramme.',
    'help.select': 'Cliquez sur un élément pour le sélectionner, <b>double-cliquez</b> pour modifier son texte.',
    'help.move': 'Les éléments existants peuvent être déplacés par glisser-déposer.',
    'help.keys': "<kbd>Suppr</kbd> supprime l'élément sélectionné, <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> pour annuler / rétablir.",
    'help.tabs': "Utilisez <b>+</b> dans la barre d'onglets pour ajouter d'autres structogrammes (fonctions).",
    'help.save': 'Le projet est enregistré automatiquement dans le navigateur. Utilisez <i>Fichier → Télécharger</i> pour en garder une copie.',
    'help.old': "Ouvrir l'ancienne version",
    'el.while.name': 'Boucle While', 'el.while.text': 'Condition',
    'el.while.info': "Une boucle While s'exécute tant que la condition est vraie. La condition est vérifiée avant chaque passage.",
    'el.dowhile.name': 'Boucle Do-While', 'el.dowhile.text': 'Condition',
    'el.dowhile.info': "Une boucle Do-While s'exécute au moins une fois. La condition est vérifiée après chaque passage.",
    'el.for.name': 'Boucle For', 'el.for.text': 'i = 1 à 10',
    'el.for.info': "Une boucle For (boucle de comptage) s'exécute un nombre de fois défini.",
    'el.if.name': 'Condition If', 'el.if.text': 'Condition',
    'el.if.info': "Si la condition est vraie, la branche de gauche (vrai) s'exécute, sinon celle de droite (faux).",
    'el.switch.name': 'Choix multiple', 'el.switch.text': 'Variable',
    'el.switch.info': "Selon la valeur d'une variable, l'un des cas est exécuté. Le dernier cas est le cas par défaut (sinon).",
    'el.instruction.name': 'Instruction', 'el.instruction.text': 'Instruction',
    'el.instruction.info': 'Une instruction simple, par exemple une affectation, une entrée ou une sortie.',
    'el.call.name': 'Fonction', 'el.call.text': 'fonction()',
    'el.call.info': "Appelle une fonction (sous-programme). D'autres structogrammes peuvent être ajoutés avec le « + » de la barre d'onglets.",
    'field.while': 'Condition', 'field.dowhile': 'Condition', 'field.for': 'Plage', 'field.if': 'Condition',
    'field.switch': 'Expression', 'field.instruction': 'Instruction', 'field.call': 'Appel de fonction',
  },

  it: {
    'menu.file': 'File', 'menu.edit': 'Modifica', 'menu.help': 'Aiuto',
    'action.new': 'Nuovo progetto', 'action.open': 'Apri progetto/file', 'action.save': 'Scarica',
    'action.code': 'Esporta codice', 'action.image': 'Crea immagine',
    'action.undo': 'Annulla', 'action.redo': 'Ripristina', 'action.delete': 'Elimina elemento',
    'action.info': 'Informazioni', 'key.delete': 'Canc',
    'language': 'Lingua',
    'tab.add': 'Nuovo strutturogramma', 'tab.rename': 'Doppio clic per rinominare', 'tab.delete': 'Elimina "{name}"',
    'palette.loops': 'Cicli', 'palette.decisions': 'Decisioni', 'palette.other': 'Altri elementi',
    'sidebar.collapse': 'Riduci menu',
    'start.new': 'Crea un nuovo progetto:', 'start.title': 'Titolo del progetto', 'start.create': 'Crea progetto',
    'start.open': 'Apri un progetto da file:', 'start.choose': 'Scegli file…',
    'start.last': 'Carica ultimo progetto modificato',
    'common.cancel': 'Annulla', 'common.delete': 'Elimina', 'common.remove': 'Rimuovi', 'common.close': 'Chiudi',
    'branch.true': 'vero', 'branch.false': 'falso',
    'case.default': 'altrimenti', 'case.placeholder': 'Caso {n}', 'case.heading': "Casi (l'ultimo è il caso predefinito)",
    'case.remove': 'Rimuovi caso', 'case.add': '+ Aggiungi caso',
    'case.removeAsk': 'Rimuovere il caso "{label}" con {n} elemento/i?',
    'diagram.main': 'Strutturogramma principale', 'diagram.function': 'Funzione {n}', 'project.default': 'Strutturogramma',
    'ask.diagramName': 'Nome dello strutturogramma', 'ask.functionName': 'Nome della funzione', 'ask.deleteDiagram': 'Eliminare "{name}"?',
    'msg.title': 'Avviso', 'msg.badFile': 'Impossibile leggere questo file.',
    'msg.imageFailed': "Impossibile caricare l'esportazione dell'immagine.", 'msg.lastFailed': "Impossibile caricare l'ultimo progetto.",
    'code.copy': 'Copia', 'code.copied': 'Copiato ✓',
    'info.title': 'Informazioni', 'info.example': 'Esempio di codice:', 'info.insert': 'Inserisci',
    'info.tip': "Suggerimento: trascina l'elemento nello strutturogramma oppure inseriscilo qui (dopo l'elemento selezionato, altrimenti alla fine).",
    'help.title': 'Informazioni', 'help.intro': '<b>Structorizer v2</b> – crea strutturogrammi (diagrammi di Nassi-Shneiderman) nel browser.',
    'help.drag': '<b>Trascina</b> gli elementi dalla barra laterale nello strutturogramma.',
    'help.select': 'Fai clic su un elemento per selezionarlo, <b>doppio clic</b> per modificarne il testo.',
    'help.move': 'Gli elementi esistenti possono essere spostati con il trascinamento.',
    'help.keys': "<kbd>Canc</kbd> elimina l'elemento selezionato, <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> per annullare / ripristinare.",
    'help.tabs': 'Usa <b>+</b> nella barra delle schede per aggiungere altri strutturogrammi (funzioni).',
    'help.save': 'Il progetto viene salvato automaticamente nel browser. Usa <i>File → Scarica</i> per conservarne una copia.',
    'help.old': 'Apri la vecchia versione',
    'el.while.name': 'Ciclo while', 'el.while.text': 'Condizione',
    'el.while.info': 'Un ciclo while viene eseguito finché la condizione è vera. La condizione viene verificata prima di ogni passaggio.',
    'el.dowhile.name': 'Ciclo do-while', 'el.dowhile.text': 'Condizione',
    'el.dowhile.info': 'Un ciclo do-while viene eseguito almeno una volta. La condizione viene verificata dopo ogni passaggio.',
    'el.for.name': 'Ciclo for', 'el.for.text': 'i = 1 a 10',
    'el.for.info': 'Un ciclo for (ciclo di conteggio) viene eseguito un numero prestabilito di volte.',
    'el.if.name': 'Condizione if', 'el.if.text': 'Condizione',
    'el.if.info': 'Se la condizione è vera viene eseguito il ramo sinistro (vero), altrimenti quello destro (falso).',
    'el.switch.name': 'Scelta multipla', 'el.switch.text': 'Variabile',
    'el.switch.info': "In base al valore di una variabile viene eseguito uno dei casi. L'ultimo è il caso predefinito (altrimenti).",
    'el.instruction.name': 'Istruzione', 'el.instruction.text': 'Istruzione',
    'el.instruction.info': "Un'istruzione semplice, ad esempio un'assegnazione, un input o un output.",
    'el.call.name': 'Funzione', 'el.call.text': 'funzione()',
    'el.call.info': 'Richiama una funzione (sottoprogramma). Altri strutturogrammi possono essere aggiunti con il "+" nella barra delle schede.',
    'field.while': 'Condizione', 'field.dowhile': 'Condizione', 'field.for': 'Intervallo', 'field.if': 'Condizione',
    'field.switch': 'Espressione', 'field.instruction': 'Istruzione', 'field.call': 'Chiamata di funzione',
  },
};

const LANG_COOKIE = 'structorizer_lang';

function savedLanguage() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return match && LANGS[match[1]] ? match[1] : null;
}

function browserLanguage() {
  const found = (navigator.languages || [navigator.language])
    .map((l) => String(l).slice(0, 2).toLowerCase())
    .find((l) => LANGS[l]);
  return found || 'en';
}

let lang = savedLanguage() || browserLanguage();

function saveLanguage() {
  const path = location.pathname.replace(/[^/]*$/, '');
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LANG_COOKIE}=${lang}; Max-Age=31536000; Path=${path}; SameSite=Lax${secure}`;
}

/** Translate a key; {placeholders} are filled from params. */
function tr(key, params = {}) {
  const text = I18N[lang][key] ?? I18N.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in params ? params[name] : m));
}

/** Translate everything in the static HTML. */
function translatePage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = tr(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = tr(el.dataset.i18nTitle); });
}
