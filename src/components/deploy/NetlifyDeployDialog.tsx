import { useState } from "react";
import JSZip from "jszip";
import { fetch } from "@tauri-apps/plugin-http";
import { useProjectStore } from "../../stores/useProjectStore";
import { exportProject } from "../../engine/export/htmlGenerator";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const TOKEN_KEY = "stackpage_netlify_token";
const SITE_KEY = "stackpage_netlify_site_id";

function loadToken() { return localStorage.getItem(TOKEN_KEY) ?? ""; }
function loadSiteId() { return localStorage.getItem(SITE_KEY) ?? ""; }
function saveToken(v: string) { localStorage.setItem(TOKEN_KEY, v); }
function saveSiteId(v: string) { localStorage.setItem(SITE_KEY, v); }

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

type Step = "idle" | "zipping" | "deploying" | "done" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function NetlifyDeployDialog({ onClose }: Props) {
  const project = useProjectStore((s) => s.project)!;

  const [token, setToken] = useState(loadToken);
  const [siteId, setSiteId] = useState(loadSiteId);
  const [deployUrl, setDeployUrl] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainMsg, setDomainMsg] = useState("");

  const isBusy = step === "zipping" || step === "deploying";

  async function handleDeploy() {
    const trimToken = token.trim();
    if (!trimToken) {
      setError("A Netlify personal access token is required.");
      return;
    }

    saveToken(trimToken);
    if (siteId.trim()) saveSiteId(siteId.trim());

    setError("");
    setStep("zipping");
    setStatusMsg("Generating site files…");

    try {
      const files = exportProject(project);

      // Build a ZIP in memory
      const zip = new JSZip();
      for (const { relativePath, content } of files) {
        zip.file(relativePath, content);
      }

      setStatusMsg("Creating ZIP archive…");
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

      setStep("deploying");

      // Determine URL: create a new site or deploy to an existing site
      const baseUrl = "https://api.netlify.com/api/v1";
      const headers: Record<string, string> = {
        Authorization: `Bearer ${trimToken}`,
        "Content-Type": "application/zip",
      };

      let deployEndpoint: string;

      async function createNewSite(): Promise<string> {
        setStatusMsg("Creating new Netlify site…");
        const createRes = await fetch(`${baseUrl}/sites`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${trimToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        if (!createRes.ok) {
          const body = await createRes.text();
          throw new Error(`Failed to create Netlify site: ${createRes.status} ${body}`);
        }
        const siteData = (await createRes.json()) as { id: string };
        setSiteId(siteData.id);
        saveSiteId(siteData.id);
        return siteData.id;
      }

      if (siteId.trim()) {
        // Deploy to existing site
        setStatusMsg(`Deploying to site ${siteId.trim()}…`);
        deployEndpoint = `${baseUrl}/sites/${encodeURIComponent(siteId.trim())}/deploys`;
      } else {
        const newId = await createNewSite();
        setStatusMsg(`Uploading to new site ${newId}…`);
        deployEndpoint = `${baseUrl}/sites/${newId}/deploys`;
      }

      let deployRes = await fetch(deployEndpoint, {
        method: "POST",
        headers,
        body: zipBlob,
      });

      // If the saved site no longer exists, create a new one and retry once
      if (deployRes.status === 404) {
        setSiteId("");
        saveSiteId("");
        const newId = await createNewSite();
        setStatusMsg(`Uploading to new site ${newId}…`);
        deployRes = await fetch(`${baseUrl}/sites/${newId}/deploys`, {
          method: "POST",
          headers,
          body: zipBlob,
        });
      }

      if (!deployRes.ok) {
        const body = await deployRes.text();
        throw new Error(`Deploy failed: ${deployRes.status} ${body}`);
      }

      const deployData = (await deployRes.json()) as { deploy_ssl_url?: string; ssl_url?: string; url?: string };
      const url = deployData.deploy_ssl_url ?? deployData.ssl_url ?? deployData.url ?? "";
      setDeployUrl(url);
      setStep("done");
    } catch (e: unknown) {
      setError(String(e));
      setStep("error");
    }
  }

  async function handleSetDomain() {
    const domain = customDomain.trim().replace(/^https?:\/\//i, "");
    if (!domain || !siteId) return;
    setDomainSaving(true);
    setDomainMsg("");
    try {
      const res = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ custom_domain: domain }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status} ${body}`);
      }
      setDomainMsg(`✓ Custom domain set to ${domain}`);
    } catch (e: unknown) {
      setDomainMsg(`Error: ${String(e)}`);
    } finally {
      setDomainSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Netlify teal blob icon */}
            <span className="text-[#00c7b7] text-xl font-bold">▲</span>
            <h2 className="text-lg font-semibold text-[#1e293b]">Deploy to Netlify</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="text-[#94a3b8] hover:text-[#1e293b] text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {step === "done" ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#00c7b7]/10 flex items-center justify-center text-3xl">
              ✓
            </div>
            <p className="text-sm font-medium text-[#1e293b]">Deployed successfully!</p>
            {deployUrl && (
              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2563eb] hover:underline break-all text-center"
              >
                {deployUrl}
              </a>
            )}

            {/* Custom domain */}
            <div className="w-full flex flex-col gap-1 mt-1">
              <label className="text-xs font-medium text-[#374151]">Custom Domain <span className="text-[#94a3b8] font-normal">(optional)</span></label>
              <div className="flex gap-2">
                <input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  disabled={domainSaving}
                  className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#00c7b7]/30 focus:border-[#00c7b7] disabled:opacity-60"
                />
                <button
                  onClick={handleSetDomain}
                  disabled={domainSaving || !customDomain.trim()}
                  className="bg-[#00c7b7] hover:bg-[#00b3a4] disabled:opacity-60 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {domainSaving ? "…" : "Set"}
                </button>
              </div>
              {domainMsg && (
                <p className={`text-xs mt-0.5 ${domainMsg.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}>{domainMsg}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full bg-[#00c7b7] hover:bg-[#00b3a4] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Info */}
            <p className="text-sm text-[#64748b]">
              Publish your site directly to Netlify. You need a{" "}
              <a
                href="https://app.netlify.com/user/applications#personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563eb] hover:underline"
              >
                personal access token
              </a>{" "}
              from your Netlify account.
            </p>

            <div className="flex flex-col gap-3">
              {/* Token */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#374151]">
                  Personal Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="nfp_…"
                  autoComplete="new-password"
                  disabled={isBusy}
                  className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#00c7b7]/30 focus:border-[#00c7b7] disabled:opacity-60"
                />
                <p className="text-xs text-[#94a3b8]">Stored locally in your browser. Never sent anywhere except Netlify.</p>
              </div>

              {/* Optional site ID */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#374151]">
                  Existing Site ID{" "}
                  <span className="text-[#94a3b8] font-normal">(optional — leave blank to create a new site)</span>
                </label>
                <input
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  placeholder="e.g. abc123de-…"
                  disabled={isBusy}
                  className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#00c7b7]/30 focus:border-[#00c7b7] disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            {/* Status / errors */}
            {step !== "idle" && statusMsg && !error && (
              <p className="text-sm text-[#64748b] bg-[#f1f5f9] rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="animate-spin inline-block">⟳</span>
                {statusMsg}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Deploy button */}
            <button
              onClick={handleDeploy}
              disabled={isBusy || !token.trim()}
              className="w-full bg-[#00c7b7] hover:bg-[#00b3a4] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {isBusy ? statusMsg || "Deploying…" : "Deploy to Netlify"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
