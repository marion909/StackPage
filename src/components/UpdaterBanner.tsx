import { useEffect, useState } from "react";

type UpdateStatus =
  | { state: "idle" }
  | { state: "available"; version: string; body: string | null }
  | { state: "downloading"; percent: number }
  | { state: "ready" }
  | { state: "error"; message: string };

/**
 * Checks for available updates on mount (Tauri only) and shows a dismissable
 * banner if a newer version is found.
 *
 * ⚠️  Requires tauri-plugin-updater configured with a valid pubkey and endpoints
 *     in tauri.conf.json before updates will actually be served.
 */
export default function UpdaterBanner() {
  const [status, setStatus] = useState<UpdateStatus>({ state: "idle" });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only run inside Tauri runtime
    if (!Object.prototype.hasOwnProperty.call(window, "__TAURI_INTERNALS__")) return;

    let cancelled = false;

    (async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (cancelled) return;
        if (update) {
          setStatus({
            state: "available",
            version: update.version,
            body: update.body ?? null,
          });
        }
      } catch {
        // Silently ignore — updater not configured or no network
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed || status.state === "idle" || status.state === "error") {
    return null;
  }

  async function handleInstall() {
    if (!Object.prototype.hasOwnProperty.call(window, "__TAURI_INTERNALS__")) return;
    if (status.state !== "available") return;

    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (!update) return;

      setStatus({ state: "downloading", percent: 0 });

      await update.downloadAndInstall((event) => {
        if (event.event === "Progress") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = event.data as any;
          const total: number = data.contentLength ?? 0;
          const downloaded: number = data.chunkLength ?? 0;
          if (total > 0) {
            setStatus({ state: "downloading", percent: Math.round((downloaded / total) * 100) });
          }
        } else if (event.event === "Finished") {
          setStatus({ state: "ready" });
        }
      });

      setStatus({ state: "ready" });
    } catch (e) {
      setStatus({ state: "error", message: String(e) });
    }
  }

  if (status.state === "ready") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between mb-4">
        <span>Update installed — restart StackPage to apply the new version.</span>
        <button onClick={() => setDismissed(true)} className="ml-4 font-bold text-green-600 hover:text-green-800">
          ×
        </button>
      </div>
    );
  }

  if (status.state === "downloading") {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-3 mb-4">
        <span>Downloading update… {status.percent > 0 ? `${status.percent}%` : ""}</span>
        <div className="flex-1 bg-blue-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${status.percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (status.state === "available") {
    return (
      <div className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] px-4 py-3 rounded-lg text-sm flex items-center justify-between mb-4">
        <div>
          <span className="font-medium">StackPage {status.version} is available.</span>
          {status.body && (
            <span className="ml-2 text-[#3b82f6] text-xs">{status.body}</span>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button
            onClick={handleInstall}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
          >
            Update &amp; Restart
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#93c5fd] hover:text-[#1e40af] font-bold"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
}
