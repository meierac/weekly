import * as React from "react";

interface ExportPreviewProps {
  weekData: {
    year: number;
    week: number;
    days: Array<{
      date: string;
      dayName: string;
      tasks: Array<{ time: string; description: string }>;
    }>;
    bibleVerse?: { text: string; reference: string } | null;
  };
  backgroundImage?: string;
}

export function ExportPreview({
  weekData,
  backgroundImage,
}: ExportPreviewProps) {
  // Load fonts for exact preview matching
  React.useEffect(() => {
    const loadFonts = () => {
      // Load Lavishly Yours
      if (!document.querySelector('link[href*="Lavishly+Yours"]')) {
        const lavishlyYoursLink = document.createElement("link");
        lavishlyYoursLink.href =
          "https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap";
        lavishlyYoursLink.rel = "stylesheet";
        document.head.appendChild(lavishlyYoursLink);
      }

      // Load Manrope
      if (!document.querySelector('link[href*="Manrope"]')) {
        const manropeLink = document.createElement("link");
        manropeLink.href =
          "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap";
        manropeLink.rel = "stylesheet";
        document.head.appendChild(manropeLink);
      }

      // Load Geologica
      if (!document.querySelector('link[href*="Geologica"]')) {
        const geologicaLink = document.createElement("link");
        geologicaLink.href =
          "https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600&display=swap";
        geologicaLink.rel = "stylesheet";
        document.head.appendChild(geologicaLink);
      }
    };

    loadFonts();
  }, []);
  // Include all 7 days of the week (Monday through Sunday) like the export
  const allWeekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const allDays = allWeekdays.map((dayName) => {
    const existingDay = weekData.days.find((d) => d.dayName === dayName);
    return existingDay || { dayName, date: "", tasks: [] };
  });

  // Extract matching colors based on background - same logic as export
  const getColorScheme = () => {
    // High contrast default color scheme for maximum readability
    let colors = {
      primary: "#1a1a1a",
      secondary: "#4a4a4a",
      accent: "#2563eb",
      text: "#2d2d2d",
    };

    if (!backgroundImage) return colors;

    // Enhanced color schemes with high contrast for readability
    if (
      backgroundImage.includes("f7f3f0") ||
      backgroundImage.includes("beige") ||
      backgroundImage.includes("elegant-beige")
    ) {
      // Beige background - high contrast warm tones
      colors = {
        primary: "#5d2e0a",
        secondary: "#8b4513",
        accent: "#b8860b",
        text: "#3d1a00",
      };
    } else if (
      backgroundImage.includes("blue") ||
      backgroundImage.includes("4f46e5") ||
      backgroundImage.includes("gradient-blue") ||
      backgroundImage.includes("ocean")
    ) {
      // Blue background - high contrast cool tones
      colors = {
        primary: "#0f172a",
        secondary: "#1e293b",
        accent: "#1d4ed8",
        text: "#0c1426",
      };
    } else if (
      backgroundImage.includes("green") ||
      backgroundImage.includes("10b981") ||
      backgroundImage.includes("gradient-green")
    ) {
      // Green background - high contrast nature tones
      colors = {
        primary: "#052e16",
        secondary: "#064e3b",
        accent: "#047857",
        text: "#022c0e",
      };
    } else if (
      backgroundImage.includes("sunset") ||
      backgroundImage.includes("f59e0b") ||
      backgroundImage.includes("gradient-sunset")
    ) {
      // Sunset background - high contrast warm tones
      colors = {
        primary: "#7c2d12",
        secondary: "#92400e",
        accent: "#ea580c",
        text: "#5c1a08",
      };
    } else if (
      backgroundImage.includes("purple") ||
      backgroundImage.includes("8b5cf6") ||
      backgroundImage.includes("gradient-purple")
    ) {
      // Purple background - high contrast purple tones
      colors = {
        primary: "#3730a3",
        secondary: "#4c1d95",
        accent: "#7c3aed",
        text: "#312e81",
      };
    } else if (
      backgroundImage.includes("f8f9fa") ||
      backgroundImage.includes("ffffff") ||
      backgroundImage.includes("faf9f7") ||
      backgroundImage.includes("minimal") ||
      backgroundImage.includes("cream")
    ) {
      // Light backgrounds - maximum contrast grays
      colors = {
        primary: "#111827",
        secondary: "#374151",
        accent: "#4f46e5",
        text: "#0f0f0f",
      };
    }

    return colors;
  };

  const colors = getColorScheme();

  const getDayName = (shortName: string): string => {
    const dayNames: Record<string, string> = {
      Mo: "Montag",
      Di: "Dienstag",
      Mi: "Mittwoch",
      Do: "Donnerstag",
      Fr: "Freitag",
      Sa: "Samstag",
      So: "Sonntag",
    };
    return dayNames[shortName] || shortName;
  };

  if (allDays.every((day) => day.tasks.length === 0)) {
    return (
      <div className="bg-muted/30 border rounded-lg p-6 text-center">
        <div className="text-2xl mb-2">📋</div>
        <h3 className="font-medium text-muted-foreground mb-2">
          Keine Aktivitäten zum Exportieren
        </h3>
        <p className="text-sm text-muted-foreground">
          Fügen Sie Aktivitäten hinzu, um eine Vorschau zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg relative overflow-hidden"
      style={{
        width: "375px",
        maxWidth: "100%",
        fontFamily: "'Manrope', Georgia, 'Times New Roman', serif",
        background: backgroundImage
          ? backgroundImage.startsWith("linear-gradient") ||
            backgroundImage.startsWith("radial-gradient") ||
            backgroundImage.startsWith("#")
            ? backgroundImage
            : `url(${backgroundImage})`
          : "#ffffff",
        backgroundSize:
          backgroundImage &&
          !backgroundImage.startsWith("linear-gradient") &&
          !backgroundImage.startsWith("radial-gradient") &&
          !backgroundImage.startsWith("#")
            ? "cover"
            : undefined,
        backgroundPosition:
          backgroundImage &&
          !backgroundImage.startsWith("linear-gradient") &&
          !backgroundImage.startsWith("radial-gradient") &&
          !backgroundImage.startsWith("#")
            ? "center"
            : undefined,
        minHeight: "667px",
        maxHeight: "800px",
        padding: "6px 8px",
        boxSizing: "border-box",
      }}
    >
      <div className="relative z-10">
        {/* Header - exact match to export */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div style={{ padding: "6px 10px", marginBottom: "2px" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "400",
                fontFamily: "'Lavishly Yours', cursive",
                color: colors.primary,
                margin: "0 0 20px 0",
                lineHeight: "1.0",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                letterSpacing: "0.5px",
              }}
            >
              Wochenprogramm
            </h1>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "'Manrope', Georgia, serif",
                color: colors.secondary,
                margin: "0",
                opacity: "0.8",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                letterSpacing: "0.3px",
              }}
            >
              Kalenderwoche {weekData.week}
            </div>
          </div>
        </div>

        {/* Days Grid - exact match to export */}
        <div className="space-y-1">
          {allDays.map((day, index) => (
            <div
              key={index}
              style={{
                marginBottom: index === allDays.length - 1 ? "0" : "4px",
                background: "rgba(255, 255, 255, 0.71)",
                boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.1)",
                borderRadius: "12px",
              }}
            >
              {/* Day header - exact match */}
              <div
                style={{
                  padding: "2px 12px 6px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    fontFamily: "'Manrope', Georgia, serif",
                    color: colors.primary,
                    letterSpacing: "0.4px",
                  }}
                >
                  {getDayName(day.dayName)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    fontFamily: "'Manrope', Georgia, serif",
                    color: colors.primary,
                  }}
                >
                  {day.date || getDayName(day.dayName)}
                </div>
              </div>

              {/* Tasks container - exact match */}
              <div
                style={{
                  minHeight: "20px",
                  position: "relative",
                  padding: day.tasks.length > 0 ? "4px 6px" : "6px",
                  textAlign: day.tasks.length > 0 ? "left" : "center",
                }}
              >
                {day.tasks.length > 0 ? (
                  day.tasks.map((task, taskIndex) => {
                    // Format time exactly like export
                    let timeText = task.time.replace("Uhr", "").trim();
                    const timeParts = timeText.split(/\s*-\s*/);
                    if (timeParts.length === 2) {
                      const startTime = timeParts[0].trim();
                      const endTime = timeParts[1].trim();
                      if (startTime === endTime) {
                        timeText = "All-Day";
                      } else {
                        timeText = `${startTime}-${endTime}`;
                      }
                    } else if (timeParts.length === 1 && timeParts[0].trim()) {
                      timeText = "All-Day";
                    }

                    return (
                      <div
                        key={taskIndex}
                        style={{
                          marginBottom:
                            taskIndex === day.tasks.length - 1 ? "12px" : "2px",
                          display: "grid",
                          gridTemplateColumns: "70px 1fr",
                          gap: "0px",
                          alignItems: "start",
                          lineHeight: "1.1",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "500",
                            color: colors.text,
                            fontSize: "9px",
                            textAlign: "left",
                            paddingLeft: "7px",
                            paddingTop: "2px",
                            width: "75px",
                            fontFamily:
                              "'Geologica', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {timeText}
                        </div>
                        <div
                          style={{
                            color: colors.text,
                            fontWeight: "400",
                            fontSize: "10px",
                            fontFamily: "'Manrope', Georgia, serif",
                            padding: "1px 3px",
                            wordWrap: "break-word",
                            lineHeight: "1.3",
                          }}
                        >
                          {task.description}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      color: colors.secondary,
                      fontSize: "9px",
                      fontWeight: "500",
                      fontFamily: "'Manrope', Georgia, serif",
                      fontStyle: "italic",
                      opacity: "0.6",
                      padding: "2px 6px",
                      display: "inline-block",
                    }}
                  >
                    Frei
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bible Verse - exact match to export */}
        {weekData.bibleVerse && (
          <div
            style={{
              marginTop: "10px",
              background: "rgba(255, 255, 255, 0)",
              padding: "8px 12px",
            }}
          >
            <blockquote
              style={{
                fontSize: "9px",
                color: colors.text,
                fontStyle: "italic",
                margin: "0 0 3px 0",
                lineHeight: "1.3",
                textAlign: "center",
                fontFamily: "'Manrope', Georgia, serif",
              }}
            >
              "{weekData.bibleVerse.text}"
            </blockquote>
            <cite
              style={{
                fontSize: "8px",
                color: colors.secondary,
                fontWeight: "500",
                textAlign: "center",
                display: "block",
                fontFamily: "'Manrope', Georgia, serif",
              }}
            >
              — {weekData.bibleVerse.reference}
            </cite>
          </div>
        )}
      </div>
    </div>
  );
}
