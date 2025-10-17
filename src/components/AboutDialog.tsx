import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Heart, Mail } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/weekly/favicon.svg"
              alt="Weekly Planner Logo"
              className="w-12 h-12"
            />
            <div>
              <DialogTitle className="text-xl font-semibold">
                Wöchentliche Agenda
              </DialogTitle>
              <DialogDescription className="text-sm">
                Version 1.0.0
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">
              Über diese App
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ein moderner Wochenplaner mit Apple-Style Design. Organisieren Sie
              Ihre Aktivitäten, erstellen Sie Vorlagen und importieren Sie Ihre
              Kalender – alles an einem Ort.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Funktionen
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Wöchentliche Aktivitätenverwaltung mit Drag & Drop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Wiederverwendbare Aktivitäten-Vorlagen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>iCal-Kalender Integration (Google, Outlook)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>PDF Export und Druckfunktion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Bibelvers der Woche (optional)</span>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Entwickelt von
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Achim Meier
                  </p>
                  <p className="text-xs text-gray-500">
                    Mit ❤️ für eine bessere Wochenplanung erstellt
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() =>
                    window.open("https://github.com/meierac", "_blank")
                  }
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() =>
                    window.open("mailto:meier.achim@outlook.com", "_blank")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Kontakt
                </Button>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wide">
              Technologie-Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                React
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                TypeScript
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                Tailwind CSS
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                shadcn/ui
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                dnd-kit
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Wöchentliche Agenda. Alle Rechte
              vorbehalten.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
