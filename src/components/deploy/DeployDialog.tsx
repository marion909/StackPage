import { useState } from "react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { exportProject } from "../../engine/export/htmlGenerator";
import {
  cmd_writeExportFiles,
  cmd_testFtp,
  cmd_deployFtp,
  pickDirectory,
} from "../../lib/tauri";
import type { FtpConfig } from "../../lib/tauri";

type Step = "idle" | "testing" | "deploying" | "done" | "error";

export default function DeployDialog() {
  const project = useProjectStore((s) => s.project)!;
  const closeDeploy = useEditorStore((s) => s.closeDeployDialog);

  const saved = project.deploySettings;
  const [host, setHost] = useState(saved?.host ?? "");
  const [port, setPort] = useState(String(saved?.port ?? "21"));
  const [username, setUsername] = useState(saved?.username ?? "");
  const [password, setPassword] = useState("");
  const [remotePath, setRemotePath] = useState(saved?.remotePath ?? "/");
  const [passive, setPassive] = useState(saved?.passive ?? true);
  const [tempDir, setTempDir] = useState<string>("");

  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function buildConfig(): FtpConfig {
    return {
      host: host.trim(),
      port: Number(port) || 21,
      username: username.trim(),
      password,
      passive,
      remotePath: remotePath.trim() || "/",
    };
  }

  async function handleTest() {
    setStep("testing");
    setError("");
    setMessage("");
    try {
      const { remotePath: _r, ...testConfig } = buildConfig();
      const result = await cmd_testFtp(testConfig);
      setMessage(result);
      setStep("idle");
    } catch (e: unknown) {
      setError(String(e));
      setStep("error");
    }
  }

  async function handleDeploy() {
    if (!host.trim() || !username.trim() || !password) {
      setError("Host, username, and password are required.");
      return;
    }

    setStep("deploying");
    setError("");
    setMessage("Generating files…");

    try {
      // 1. Generate files in memory
      const files = exportProject(project);

      // 2. Pick a temp directory if not already set
      let outputDir = tempDir;
      if (!outputDir) {
        const dir = await pickDirectory();
        if (!dir) {
          setStep("idle");
          setMessage("");
          return;
        }
        outputDir = dir;
        setTempDir(dir);
      }

      // 3. Write to export dir
      setMessage("Writing export files…");
      await cmd_writeExportFiles(files, outputDir);

      // 4. Upload via FTP
      setMessage("Uploading…");
      const result = await cmd_deployFtp(buildConfig(), outputDir);
      setMessage(result);
      setStep("done");
    } catch (e: unknown) {
      setError(String(e));
      setStep("error");
    }
  }

  const isBusy = step === "testing" || step === "deploying";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1e293b]">Publish via FTP</h2>
          <button
            onClick={closeDeploy}
            disabled={isBusy}
            className="text-[#94a3b8] hover:text-[#1e293b] text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {step === "done" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-sm text-[#64748b] text-center">{message}</p>
            <button
              onClick={closeDeploy}
              className="mt-2 w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Connection fields */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-[#374151]">Host</label>
                  <input
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="ftp.example.com"
                    disabled={isBusy}
                    className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1 w-20">
                  <label className="text-xs font-medium text-[#374151]">Port</label>
                  <input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="21"
                    disabled={isBusy}
                    className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#374151]">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ftpuser"
                  autoComplete="username"
                  disabled={isBusy}
                  className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#374151]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isBusy}
                  className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#374151]">Remote Path</label>
                <input
                  value={remotePath}
                  onChange={(e) => setRemotePath(e.target.value)}
                  placeholder="/public_html"
                  disabled={isBusy}
                  className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passive}
                  onChange={(e) => setPassive(e.target.checked)}
                  disabled={isBusy}
                  className="rounded"
                />
                <span className="text-sm text-[#374151]">Passive mode (recommended)</span>
              </label>
            </div>

            {/* Status feedback */}
            {message && (
              <p className="text-sm text-[#64748b] bg-[#f1f5f9] rounded-lg px-3 py-2">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Note about export directory */}
            <p className="text-xs text-[#94a3b8]">
              Files will be exported to a local folder you choose, then uploaded via FTP.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleTest}
                disabled={isBusy || !host.trim() || !username.trim()}
                className="flex-1 border border-[#d1d5db] text-[#374151] py-2.5 rounded-lg text-sm font-medium hover:bg-[#f9fafb] disabled:opacity-50 transition-colors"
              >
                {step === "testing" ? "Testing…" : "Test Connection"}
              </button>
              <button
                onClick={handleDeploy}
                disabled={isBusy}
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {step === "deploying" ? "Deploying…" : "Deploy"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
