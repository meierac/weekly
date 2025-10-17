import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Book, X, Sparkles } from "lucide-react";
import {
  getBibleVerse,
  refreshBibleVerse,
  isBibleVerseEnabled,
  setBibleVerseEnabled,
} from "../lib/bible-verse";

interface BibleVerseProps {
  className?: string;
}

export function BibleVerse({ className = "" }: BibleVerseProps) {
  const [verse, setVerse] = React.useState<{
    text: string;
    reference: string;
  } | null>(null);
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    const enabled = isBibleVerseEnabled();
    setIsEnabled(enabled);

    if (enabled) {
      const currentVerse = getBibleVerse();
      setVerse(currentVerse);
    } else {
      setVerse(null);
    }
  }, []);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setBibleVerseEnabled(newEnabled);
    setIsEnabled(newEnabled);

    if (newEnabled) {
      const currentVerse = getBibleVerse();
      setVerse(currentVerse);
    } else {
      setVerse(null);
    }
  };

  const handleRefresh = async () => {
    if (!isEnabled) return;

    setIsRefreshing(true);
    // Add a small delay to show the loading state
    setTimeout(() => {
      const newVerse = refreshBibleVerse();
      setVerse(newVerse);
      setIsRefreshing(false);
    }, 500);
  };

  if (!isEnabled) {
    return (
      <div
        data-bible-verse-container
        data-bible-verse-enabled="false"
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ${className}`}
      >
        {/* Day Header - matching day card style */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex flex-col items-center justify-center w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Book className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Bibelvers
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center py-4">
            <Sparkles className="h-5 w-5 mx-auto mb-1.5 text-amber-500 dark:text-amber-400" />
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
              Lassen Sie sich inspirieren
            </p>
            <Button
              onClick={handleToggle}
              size="sm"
              className="h-8 px-4 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-xs"
            >
              Aktivieren
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-bible-verse-container
      data-bible-verse-enabled="true"
      data-bible-verse-text={verse?.text}
      data-bible-verse-reference={verse?.reference}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 ${className}`}
    >
      {/* Day Header - matching day card style */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex flex-col items-center justify-center w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Book className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Bibelvers
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Neuen Vers laden"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={handleToggle}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Bibelvers ausblenden"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - matching task card style */}
      {verse && (
        <div className="p-4">
          <blockquote
            className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3 italic"
            data-verse-text
          >
            "{verse.text}"
          </blockquote>
          <cite
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 block"
            data-verse-reference
          >
            — {verse.reference}
          </cite>
        </div>
      )}
    </div>
  );
}
