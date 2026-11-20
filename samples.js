'use strict';

/* =========================================================
   Example projects: small programs that show the elements and
   work in Run (step through) and in the Java / Python export.
   Texts in the diagrams are code (the same in every language);
   titles and descriptions are translated here.
   ========================================================= */

// Element builders (fresh ids every time a sample is loaded)
const S = {
  ins: (text) => ({ type: 'instruction', text }),
  call: (text) => ({ type: 'call', text }),
  jump: (text) => ({ type: 'jump', text }),
  while: (text, body) => ({ type: 'while', text, body }),
  dowhile: (text, body) => ({ type: 'dowhile', text, body }),
  for: (text, body) => ({ type: 'for', text, body }),
  if: (text, yes, no = []) => ({ type: 'if', text, yes, no }),
  switch: (text, cases) => ({ type: 'switch', text, cases: cases.map(([label, body]) => ({ label, body })) }),
  parallel: (...threads) => ({ type: 'parallel', text: '', threads }),
};

const SAMPLES = [
  {
    id: 'sum',
    title: { de: 'Summe 1 bis n', en: 'Sum 1 to n', fr: 'Somme de 1 à n', it: 'Somma da 1 a n' },
    info: {
      de: 'Eingabe, Zählschleife und Ausgabe.',
      en: 'Input, counting loop and output.',
      fr: 'Saisie, boucle de comptage et sortie.',
      it: 'Input, ciclo di conteggio e output.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.ins('n = int(input("n = "))'),
        S.ins('sum = 0'),
        S.for('i = 1 to n', [S.ins('sum = sum + i')]),
        S.ins('print("Sum: " + sum)'),
      ] },
    ],
  },
  {
    id: 'gcd',
    title: { de: 'Grösster gemeinsamer Teiler', en: 'Greatest common divisor', fr: 'Plus grand commun diviseur', it: 'Massimo comun divisore' },
    info: {
      de: 'Euklidischer Algorithmus mit einer While-Schleife.',
      en: "Euclid's algorithm with a while loop.",
      fr: "Algorithme d'Euclide avec une boucle while.",
      it: 'Algoritmo di Euclide con un ciclo while.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.ins('a = 84'),
        S.ins('b = 36'),
        S.while('b != 0', [
          S.ins('t = b'),
          S.ins('b = a % b'),
          S.ins('a = t'),
        ]),
        S.ins('print("GCD: " + a)'),
      ] },
    ],
  },
  {
    id: 'guess',
    title: { de: 'Zahlen raten', en: 'Guess the number', fr: 'Devine le nombre', it: 'Indovina il numero' },
    info: {
      de: 'DoWhile-Schleife, verschachtelte If-Abfragen und eine Zufallszahl.',
      en: 'Do-while loop, nested if statements and a random number.',
      fr: 'Boucle do-while, conditions imbriquées et un nombre aléatoire.',
      it: 'Ciclo do-while, if annidati e un numero casuale.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.ins('secret = int(Math.random() * 100) + 1'),
        S.ins('tries = 0'),
        S.dowhile('guess != secret', [
          S.ins('guess = int(input("Guess (1-100): "))'),
          S.ins('tries = tries + 1'),
          S.if('guess < secret', [S.ins('print("higher")')], [
            S.if('guess > secret', [S.ins('print("lower")')]),
          ]),
        ]),
        S.ins('print("Correct after " + tries + " tries")'),
      ] },
    ],
  },
  {
    id: 'factorial',
    title: { de: 'Fakultät (Rekursion)', en: 'Factorial (recursion)', fr: 'Factorielle (récursivité)', it: 'Fattoriale (ricorsione)' },
    info: {
      de: 'Eine Funktion als eigenes Struktogramm, die sich selbst aufruft.',
      en: 'A function in its own diagram that calls itself.',
      fr: "Une fonction dans son propre structogramme qui s'appelle elle-même.",
      it: 'Una funzione in un proprio strutturogramma che richiama sé stessa.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.for('n = 1 to 6', [
          S.call('f = fact(n)'),
          S.ins('print(n + "! = " + f)'),
        ]),
      ] },
      { name: 'fact(k)', body: [
        S.if('k <= 1', [S.jump('return 1')], [S.jump('return k * fact(k - 1)')]),
      ] },
    ],
  },
  {
    id: 'weekday',
    title: { de: 'Wochentag', en: 'Day of the week', fr: 'Jour de la semaine', it: 'Giorno della settimana' },
    info: {
      de: 'Mehrfachauswahl mit mehreren Werten pro Fall.',
      en: 'Multiple choice with several values per case.',
      fr: 'Choix multiple avec plusieurs valeurs par cas.',
      it: 'Scelta multipla con più valori per caso.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.ins('day = int(input("Day (1-7): "))'),
        S.switch('day', [
          ['1, 2, 3, 4', [S.ins('print("Working day")')]],
          ['5', [S.ins('print("Almost weekend")')]],
          ['6, 7', [S.ins('print("Weekend!")')]],
          ['default', [S.ins('print("No such day")')]],
        ]),
      ] },
    ],
  },
  {
    id: 'primes',
    title: { de: 'Primzahlen', en: 'Prime numbers', fr: 'Nombres premiers', it: 'Numeri primi' },
    info: {
      de: 'Verschachtelte Schleifen; ein Aussprung (break) beendet die innere Schleife.',
      en: 'Nested loops; a jump (break) ends the inner loop.',
      fr: 'Boucles imbriquées ; un saut (break) termine la boucle intérieure.',
      it: 'Cicli annidati; un salto (break) termina il ciclo interno.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.for('n = 2 to 30', [
          S.ins('prime = true'),
          S.ins('d = 2'),
          S.while('d * d <= n', [
            S.if('n % d == 0', [S.ins('prime = false'), S.jump('break')]),
            S.ins('d = d + 1'),
          ]),
          S.if('prime', [S.ins('print(n)')]),
        ]),
      ] },
    ],
  },
  {
    id: 'table',
    title: { de: 'Einmaleins', en: 'Times table', fr: 'Table de multiplication', it: 'Tabellina' },
    info: {
      de: 'Zwei verschachtelte For-Schleifen und Ausgabe ohne Zeilenumbruch.',
      en: 'Two nested for loops and output without a line break.',
      fr: 'Deux boucles for imbriquées et une sortie sans retour à la ligne.',
      it: 'Due cicli for annidati e output senza a capo.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.for('i = 1 to 5', [
          S.for('j = 1 to 5', [S.ins('System.out.printf("%4d", i * j)')]),
          S.ins('System.out.println()'),
        ]),
      ] },
    ],
  },
  {
    id: 'parallel',
    title: { de: 'Parallele Abläufe', en: 'Parallel tasks', fr: 'Tâches parallèles', it: 'Attività parallele' },
    info: {
      de: 'Zwei Zweige laufen gleichzeitig (Threads); im Ausführen-Modus abwechselnd.',
      en: 'Two branches run at the same time (threads); in Run they take turns.',
      fr: "Deux branches s'exécutent en même temps (threads) ; en mode Exécuter, à tour de rôle.",
      it: 'Due rami vengono eseguiti contemporaneamente (thread); in Esegui a turno.',
    },
    diagrams: [
      { name: 'Main', body: [
        S.ins('print("Start")'),
        S.parallel(
          [S.for('a = 1 to 3', [S.ins('print("A" + a)')])],
          [S.for('b = 1 to 3', [S.ins('print("B" + b)')])],
        ),
        S.ins('print("Both done")'),
      ] },
    ],
  },
];

/** Give every element an id and mark texts as edited (not placeholders). */
function buildSampleBody(list) {
  return list.map((n) => {
    const node = { ...n, id: uid(), auto: false };
    if (n.body) node.body = buildSampleBody(n.body);
    if (n.yes) { node.yes = buildSampleBody(n.yes); node.no = buildSampleBody(n.no); }
    if (n.cases) node.cases = n.cases.map((c) => ({ label: c.label, body: buildSampleBody(c.body) }));
    if (n.threads) node.threads = n.threads.map(buildSampleBody);
    return node;
  });
}

/** Dialog listing the examples; picking one opens it as a new project. */
function showSamples() {
  const list = document.createElement('div');
  list.className = 'sample-list';
  SAMPLES.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'sample';
    const title = document.createElement('b');
    title.textContent = s.title[lang] || s.title.en;
    const info = document.createElement('span');
    info.textContent = s.info[lang] || s.info.en;
    b.append(title, info);
    b.onclick = () => openSample(s);
    list.append(b);
  });
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = tr('samples.hint');
  const div = document.createElement('div');
  div.append(list, hint);
  if ($('#startDialog').open) $('#startDialog').close();
  openInfo(tr('samples.title'), div);
}

async function openSample(s) {
  $('#infoDialog').close();
  // the browser only keeps one project: ask before replacing one that has content
  const hasContent = project && project.diagrams.some((d) => d.body.length);
  if (hasContent && !await ask(tr('samples.replace', { title: project.title }), null, tr('samples.open'))) {
    if (!project) showStart();
    return;
  }
  if (runner) closeRun();
  loadProject(sampleProject(s));
  track('sample_open', { sample: s.id });
}

/** A new project made from a sample, titled in the current language. */
function sampleProject(sample) {
  const title = sample.title[lang] || sample.title.en;
  return {
    title,
    auto: false,
    active: 0,
    diagrams: sample.diagrams.map((d, i) => ({
      name: i === 0 ? title : d.name,
      auto: false,
      body: buildSampleBody(d.body),
    })),
  };
}
