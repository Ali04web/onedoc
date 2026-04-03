import { useState, useEffect } from "react";

export function useScripts(urls: string[]) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let n = 0; const total = urls.length;
    urls.forEach(url => {
      if (document.querySelector(`script[src="${url}"]`)) { 
        if (++n === total) setReady(true); 
        return; 
      }
      const s = document.createElement("script"); 
      s.src = url; 
      s.async = true;
      s.onload = () => { if(++n === total) setReady(true); };
      document.head.appendChild(s);
    });
  }, [urls]);
  return ready;
}
