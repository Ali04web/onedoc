/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${url}"]`
    ) as HTMLScriptElement | null;

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const onLoad = () => {
      const script = existing ?? document.createElement("script");
      script.dataset.loaded = "true";
      resolve();
    };

    const onError = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });

      const readyState = (existing as HTMLScriptElement & {
        readyState?: string;
      }).readyState;
      if (readyState === "loaded" || readyState === "complete") {
        onLoad();
      } else {
        window.setTimeout(() => {
          existing.dataset.loaded = existing.dataset.loaded || "true";
          resolve();
        }, 120);
      }
      return;
    }

    const script = document.createElement("script");
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  });
}

export function useScripts(urls: string[]) {
  const [ready, setReady] = useState(false);
  const key = urls.join("|");

  useEffect(() => {
    let active = true;
    setReady(false);

    Promise.all(urls.map((url) => loadScript(url)))
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setReady(false);
      });

    return () => {
      active = false;
    };
  }, [key]);

  return ready;
}
