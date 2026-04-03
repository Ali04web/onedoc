export const esc = (s: string | number) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
export const stem = (n: string) => n.replace(/\.[^.]+$/,"");
export const fmtSize = (b: number) => b<1024?b+"B":b<1048576?(b/1024).toFixed(1)+"KB":(b/1048576).toFixed(1)+"MB";
export const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

export function dlBlob(name: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

export function dlText(name: string, txt: string) {
  dlBlob(name, new Blob([txt], {type:"text/plain;charset=utf-8"}));
}

export function parsePageRange(str: string, total: number) {
  const p = new Set<number>();
  str.split(",").forEach(part => {
    part = part.trim();
    if(part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for(let i=Math.max(1,a); i<=Math.min(total,b); i++) p.add(i);
    } else {
      const n = parseInt(part);
      if(n>=1 && n<=total) p.add(n);
    }
  });
  return [...p].sort((a,b)=>a-b);
}

export function computeStats(text: string) {
  const words = text.match(/\b\w+\b/g) || [];
  const stop = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","is","it","was","are","be","this","that","with","as","by","from","have","has","had","not","they","we","you","he","she","his","her","its","our","their","been","will","would","could","should","may","might","do","does","did","so","if","than","then","when","where","which","who","what","how","all","about","up","out","more","also","just","can","one","into","over","after","there","these","those","i","me","my","your"]);
  const freq: Record<string, number> = {};
  words.forEach(w => {
    const lw = w.toLowerCase();
    if(!stop.has(lw) && lw.length>2) freq[lw] = (freq[lw] || 0) + 1;
  });
  return {
    wordCount: words.length,
    charCount: text.length,
    sentenceCount: (text.match(/[.!?]+/g) || []).length,
    readingTime: Math.ceil(words.length/200),
    topWords: Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,15)
  };
}
