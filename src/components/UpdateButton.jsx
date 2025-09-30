import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UpdateButton() {
  const [waiting, setWaiting] = useState(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
          setWaiting(reg.waiting);
          showUpdateToast();
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaiting(newWorker);
                showUpdateToast();
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waiting) waiting.postMessage({ type: "SKIP_WAITING" });
  };

  const showUpdateToast = () => {
    toast.info(
      <div>
        A new version is available!{" "}
        <button
          onClick={handleUpdate}
          style={{
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "4px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "8px",
          }}
        >
          Update Now
        </button>
      </div>,
      {
        position: "top-center",
        autoClose: false, // stays until user clicks
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return null; // no extra button here, toast handles the update
}
