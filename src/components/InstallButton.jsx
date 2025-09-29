import usePWAInstall from "../hooks/usePWAInstall";
import "../styles/InstallButton.css";

export default function InstallButton() {
  const { isInstallable, installApp } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button className="install-btn" onClick={installApp}>
      📲 Install Cashbook
    </button>
  );
}
