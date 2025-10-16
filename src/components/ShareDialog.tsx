import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Send, Download, Loader2 } from "lucide-react";
import {
  shareToWhatsApp,
  shareToTelegram,
  shareWeeklyAgenda,
  downloadWeeklyImage,
  isShareSupported,
  isFileShareSupported,
} from "@/lib/share";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendaElement: HTMLElement | null;
  weekInfo: { year: number; week: number };
}

export function ShareDialog({
  open,
  onOpenChange,
  agendaElement,
  weekInfo,
}: ShareDialogProps) {
  const [isSharing, setIsSharing] = React.useState(false);
  const [sharingTo, setSharingTo] = React.useState<string | null>(null);

  const handleShareToWhatsApp = async () => {
    if (!agendaElement) return;

    setIsSharing(true);
    setSharingTo("whatsapp");
    try {
      await shareToWhatsApp(agendaElement, weekInfo, {
        format: "png",
        quality: 95,
        scale: 2,
      });
      // Don't close dialog automatically - user might want to share elsewhere
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
      alert("Fehler beim Teilen auf WhatsApp");
    } finally {
      setIsSharing(false);
      setSharingTo(null);
    }
  };

  const handleShareToTelegram = async () => {
    if (!agendaElement) return;

    setIsSharing(true);
    setSharingTo("telegram");
    try {
      await shareToTelegram(agendaElement, weekInfo, {
        format: "png",
        quality: 95,
        scale: 2,
      });
      // Don't close dialog automatically - user might want to share elsewhere
    } catch (error) {
      console.error("Error sharing to Telegram:", error);
      alert("Fehler beim Teilen auf Telegram");
    } finally {
      setIsSharing(false);
      setSharingTo(null);
    }
  };

  const handleNativeShare = async () => {
    if (!agendaElement) return;

    setIsSharing(true);
    setSharingTo("native");
    try {
      await shareWeeklyAgenda(agendaElement, weekInfo, {
        format: "png",
        quality: 95,
        scale: 2,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      if ((error as Error).message !== "AbortError") {
        alert("Fehler beim Teilen");
      }
    } finally {
      setIsSharing(false);
      setSharingTo(null);
    }
  };

  const handleDownload = async () => {
    if (!agendaElement) return;

    setIsSharing(true);
    setSharingTo("download");
    try {
      await downloadWeeklyImage(agendaElement, weekInfo, {
        format: "png",
        quality: 95,
        scale: 2,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Fehler beim Herunterladen");
    } finally {
      setIsSharing(false);
      setSharingTo(null);
    }
  };

  const supportsNativeShare = isShareSupported();
  const supportsFileShare = isFileShareSupported();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Wochenplan teilen
              </DialogTitle>
              <DialogDescription className="text-sm">
                KW {weekInfo.week} {weekInfo.year}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Hinweis:</strong>{" "}
              {supportsFileShare ? (
                <>Ihr Wochenplan wird als Bild geteilt.</>
              ) : (
                <>
                  Auf Desktop: Laden Sie das Bild herunter und teilen Sie es
                  manuell in WhatsApp/Telegram Web oder Desktop-App.
                </>
              )}
            </p>
          </div>

          {/* Native Share (if supported) */}
          {supportsNativeShare && (
            <Button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {isSharing && sharingTo === "native" ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Wird geteilt...
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5 mr-2" />
                  Teilen
                </>
              )}
            </Button>
          )}

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleShareToWhatsApp}
              disabled={isSharing}
              className="h-12 border-green-200 hover:border-green-300 hover:bg-green-50"
            >
              {isSharing && sharingTo === "whatsapp" ? (
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">WhatsApp</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleShareToTelegram}
              disabled={isSharing}
              className="h-12 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            >
              {isSharing && sharingTo === "telegram" ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-blue-700 font-medium">Telegram</span>
                </>
              )}
            </Button>
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isSharing}
            className="w-full h-12"
          >
            {isSharing && sharingTo === "download" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Als Bild herunterladen
              </>
            )}
          </Button>

          {/* Help text */}
          <div className="text-xs text-gray-500 text-center pt-2">
            {supportsFileShare ? (
              "Wählen Sie die gewünschte App zum Teilen"
            ) : (
              <span>
                <strong>Desktop:</strong> Bild herunterladen → WhatsApp/Telegram
                öffnen → Bild hochladen
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
