import { useState } from "react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { exportProject } from "../../engine/export/htmlGenerator";
import {
  cmd_writeExportFiles,
  cmd_testFtp,
  cmd_deployFtp,
  cmd_testSftp,
  cmd_deploySftp,
  pickDirectory,
} from "../../lib/tauri";
import type { FtpConfig, SftpConfig } from "../../lib/tauri";

type Step = "idle" | "testing" | "deploying" | "done" | "error";
type Protocol = "ftp" | "sftp";

export default function DeployDialog() {
  const project = useProjectStore((s) => s.project)!;
  const closeDeploy = useEditorStore((s) => s.closeDeployDialog);

  const saved = project.deploySettings;
  const [protocol, setProtocol] = useState<Protocol>(saved?.protocol ?? "ftp");
  const [host, setHost] = useState(saved?.host ?? "");
  const [port, setPort] = useState(String(saved?.port ?? protocol === "sftp" ? "22" : "21"));
  const [username, setUsername] = useState(saved?.username ?? "");
  const [password, setPassword] = useState("");
  const [remotePath, setRemotePath] = useState(saved?.remotePath ?? "/");
  const [passive, setPassive] = useState(saved?.passive ?? true);
  const [tempDir, setTempDir] = useState<string>("");

  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function buildFtpConfig(): FtpConfig {
    return {
      host: host.trim(),
      port: Number(port) || 21,
      username: username.trim(),
      password,
      passive,
      remotePath: remotePath.trim() || "/",
    };
  }

  function buildSftpConfig(): SftpConfig {
    return {
      host: host.trim(),
      port: Number(port) || 22,
      username: username.trim(),
      password,
      remotePath: remotePath.trim() || "/",
    };
  }

  function handleProtocolSwitch(p: Protocol) {
    setProtocol(p);
    setPort(p === "sftp" ? "22" : "21");
    setStep("idle");
    setMessage("");
    setError("");
  }

  async function handleTest() {
    setStep("testing");
    setError("");
    setMessage("");
    try {
      let result: string;
      if (protocol === "ftp") {
        const { remotePath: _r, ...testConfig } = buildFtpConfig();
        result = await cmd_testFtp(testConfig);
      } else {
        result = await cmd_testSftp(buildSftpConfig());
      }
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
      const files = exportProject(project);

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

      setMessage("Writing export files…");
      await cmd_writeExportFiles(files, outputDir);

      setMessage("Uploading…");
      let result: string;
      if (protocol === "ftp") {
        result = await cmd_deployFtp(buildFtpConfig(), outputDir);
      } else {
        result = await cmd_deploySftp(buildSftpConfig(), outputDir);
      }
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
          <h2 className="text-lg font-semibold text-[#1e293b]">Publish via FTP / SFTP</h2>
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
            {/* Protocol tabs */}
            <div className="flex rounded-lg border border-[#e2e8f0] overflow-hidden text-sm font-medium">
              {(["ftp", "sftp"] as Protocol[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProtocolSwitch(p)}
                  disabled={isBusy}
                  className={`flex-1 py-2 transition-colors ${
                    protocol === p
                      ? "bg-[#2563eb] text-white"
                      : "text-[#64748b] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Connection fields */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-[#374151]">Host</label>
                  <input
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder={protocol === "sftp" ? "ssh.example.com" : "ftp.example.com"}
                    disabled={isBusy}
                    className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1 w-20">
                  <label className="text-xs font-medium text-[#374151]">Port</label>
                  <input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={protocol === "sftp" ? "22" : "21"}
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
                  placeholder={protocol === "sftp" ? "ssh-user" : "ftpuser"}
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

              {protocol === "ftp" && (
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
              )}
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

            <p className="text-xs text-[#94a3b8]">
              Files will be exported to a local folder you choose, then uploaded via {protocol.toUpperCase()}.
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
