export interface BibleVerse {
  text: string;
  reference: string;
}

// Curated collection of inspiring Bible verses in German
const BIBLE_VERSES: BibleVerse[] = [
  {
    text: "Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.",
    reference: "Jeremia 29,11",
  },
  {
    text: "Ich kann alles durch den, der mich stark macht.",
    reference: "Philipper 4,13",
  },
  {
    text: "Der HERR ist mein Hirte, mir wird nichts mangeln.",
    reference: "Psalm 23,1",
  },
  {
    text: "Fürchte dich nicht, denn ich bin mit dir und will dich segnen.",
    reference: "1. Mose 26,24",
  },
  {
    text: "Alle eure Sorge werft auf ihn; denn er sorgt für euch.",
    reference: "1. Petrus 5,7",
  },
  {
    text: "Der HERR segne dich und behüte dich; der HERR lasse sein Angesicht leuchten über dir und sei dir gnädig.",
    reference: "4. Mose 6,24-25",
  },
  {
    text: "Vertraue auf den HERRN von ganzem Herzen, und verlass dich nicht auf deinen Verstand.",
    reference: "Sprüche 3,5",
  },
  {
    text: "Jesus spricht: Ich bin bei euch alle Tage bis an der Welt Ende.",
    reference: "Matthäus 28,20",
  },
  {
    text: "Gott ist Liebe; und wer in der Liebe bleibt, der bleibt in Gott und Gott in ihm.",
    reference: "1. Johannes 4,16",
  },
  {
    text: "Sei getrost und unverzagt! Fürchte dich nicht und lass dich nicht erschrecken; denn der HERR, dein Gott, ist mit dir überall, wo du hingehst.",
    reference: "Josua 1,9",
  },
  {
    text: "Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.",
    reference: "Matthäus 11,28",
  },
  {
    text: "Die Gnade unseres Herrn Jesus Christus und die Liebe Gottes und die Gemeinschaft des Heiligen Geistes sei mit euch allen!",
    reference: "2. Korinther 13,13",
  },
  {
    text: "Der HERR wird für euch streiten, und ihr werdet stille sein.",
    reference: "2. Mose 14,14",
  },
  {
    text: "Denn Gott hat uns nicht gegeben den Geist der Furcht, sondern der Kraft und der Liebe und der Besonnenheit.",
    reference: "2. Timotheus 1,7",
  },
  {
    text: "Freut euch in dem Herrn allewege, und abermals sage ich: Freut euch!",
    reference: "Philipper 4,4",
  },
  {
    text: "Jesus spricht: Ich bin der Weg und die Wahrheit und das Leben.",
    reference: "Johannes 14,6",
  },
  {
    text: "Denn aus Gnade seid ihr selig geworden durch Glauben, und das nicht aus euch: Gottes Gabe ist es.",
    reference: "Epheser 2,8",
  },
  {
    text: "Der HERR ist meine Stärke und mein Schild; auf ihn hofft mein Herz und mir ist geholfen.",
    reference: "Psalm 28,7",
  },
  {
    text: "Bittet, so wird euch gegeben; suchet, so werdet ihr finden; klopfet an, so wird euch aufgetan.",
    reference: "Matthäus 7,7",
  },
  {
    text: "Denn wo zwei oder drei versammelt sind in meinem Namen, da bin ich mitten unter ihnen.",
    reference: "Matthäus 18,20",
  },
  {
    text: "Der HERR ist nahe denen, die zerbrochenen Herzens sind, und hilft denen, die ein zerschlagenes Gemüt haben.",
    reference: "Psalm 34,19",
  },
  {
    text: "Lass dir an meiner Gnade genügen; denn meine Kraft ist in den Schwachen mächtig.",
    reference: "2. Korinther 12,9",
  },
  {
    text: "Siehe, ich mache alles neu!",
    reference: "Offenbarung 21,5",
  },
  {
    text: "Der HERR denkt an uns und segnet uns.",
    reference: "Psalm 115,12",
  },
  {
    text: "Und wir wissen, dass denen, die Gott lieben, alle Dinge zum Besten dienen.",
    reference: "Römer 8,28",
  },
  {
    text: "Denn meine Gedanken sind nicht eure Gedanken, und eure Wege sind nicht meine Wege, spricht der HERR.",
    reference: "Jesaja 55,8",
  },
  {
    text: "Der HERR ist mein Licht und mein Heil; vor wem sollte ich mich fürchten?",
    reference: "Psalm 27,1",
  },
  {
    text: "Lehre uns bedenken, dass wir sterben müssen, auf dass wir klug werden.",
    reference: "Psalm 90,12",
  },
  {
    text: "Seid fröhlich in Hoffnung, geduldig in Trübsal, beharrlich im Gebet.",
    reference: "Römer 12,12",
  },
  {
    text: "Der HERR behüte deinen Ausgang und Eingang von nun an bis in Ewigkeit!",
    reference: "Psalm 121,8",
  },
];

// Storage keys
const BIBLE_VERSE_SETTINGS_KEY = "bible-verse-settings";

interface BibleVerseSettings {
  enabled: boolean;
  lastChanged: string; // ISO date string
  currentVerseIndex: number;
}

// Get default settings
function getDefaultSettings(): BibleVerseSettings {
  return {
    enabled: false,
    lastChanged: new Date().toISOString(),
    currentVerseIndex: Math.floor(Math.random() * BIBLE_VERSES.length),
  };
}

// Load settings from localStorage
function loadSettings(): BibleVerseSettings {
  try {
    const stored = localStorage.getItem(BIBLE_VERSE_SETTINGS_KEY);
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading Bible verse settings:", error);
  }
  return getDefaultSettings();
}

// Save settings to localStorage
function saveSettings(settings: BibleVerseSettings): void {
  try {
    localStorage.setItem(BIBLE_VERSE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving Bible verse settings:", error);
  }
}

// Check if Bible verse feature is enabled
export function isBibleVerseEnabled(): boolean {
  const settings = loadSettings();
  return settings.enabled;
}

// Enable or disable Bible verse feature
export function setBibleVerseEnabled(enabled: boolean): void {
  const settings = loadSettings();
  settings.enabled = enabled;

  if (enabled) {
    // Always ensure we have a valid verse index when enabling
    if (
      !settings.currentVerseIndex ||
      settings.currentVerseIndex < 0 ||
      settings.currentVerseIndex >= BIBLE_VERSES.length
    ) {
      settings.currentVerseIndex = Math.floor(
        Math.random() * BIBLE_VERSES.length,
      );
      settings.lastChanged = new Date().toISOString();
    }
  }

  saveSettings(settings);
}

// Get current Bible verse
export function getBibleVerse(): BibleVerse {
  const settings = loadSettings();

  // Auto-refresh verse weekly (every 7 days)
  const lastChanged = new Date(settings.lastChanged);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff >= 7) {
    return refreshBibleVerse();
  }

  // Ensure we have a valid index
  if (
    typeof settings.currentVerseIndex !== "number" ||
    settings.currentVerseIndex >= BIBLE_VERSES.length ||
    settings.currentVerseIndex < 0
  ) {
    settings.currentVerseIndex = Math.floor(
      Math.random() * BIBLE_VERSES.length,
    );
    settings.lastChanged = new Date().toISOString();
    saveSettings(settings);
  }

  return BIBLE_VERSES[settings.currentVerseIndex];
}

// Manually refresh to get a new Bible verse
export function refreshBibleVerse(): BibleVerse {
  const settings = loadSettings();
  let newIndex;

  // Ensure we get a different verse than the current one (if possible)
  if (BIBLE_VERSES.length > 1) {
    do {
      newIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    } while (newIndex === settings.currentVerseIndex);
  } else {
    newIndex = 0;
  }

  settings.currentVerseIndex = newIndex;
  settings.lastChanged = new Date().toISOString();
  saveSettings(settings);

  return BIBLE_VERSES[newIndex];
}

// Get all available verses (for potential future features)
export function getAllBibleVerses(): BibleVerse[] {
  return [...BIBLE_VERSES];
}

// Get verse by reference (for search functionality)
export function getVerseByReference(reference: string): BibleVerse | null {
  return (
    BIBLE_VERSES.find((verse) =>
      verse.reference.toLowerCase().includes(reference.toLowerCase()),
    ) || null
  );
}
