import { z } from "zod";

const root = document.querySelector<HTMLElement>("#tool-form");
if (root) {
  const slug = root.dataset.tool ?? "";
  const input = document.querySelector<HTMLTextAreaElement>("#tool-input")!;
  const output = document.querySelector<HTMLTextAreaElement>("#tool-output")!;
  const status = document.querySelector<HTMLElement>("#tool-status")!;
  const meta = document.querySelector<HTMLElement>("#result-meta")!;
  const extra = document.querySelector<HTMLElement>("#extra-fields")!;
  const run = document.querySelector<HTMLButtonElement>("#run-tool")!;
  const copy = document.querySelector<HTMLButtonElement>("#copy-result")!;
  const download = document.querySelector<HTMLButtonElement>("#download-result")!;
  const reset = document.querySelector<HTMLButtonElement>("#reset-tool")!;
  let downloadBlob: Blob | null = null;
  let typingStarted = 0;
  let typingTimer: number | undefined;

  const setStatus = (message: string, error = false) => {
    status.textContent = message;
    status.className = `text-xs mt-4 ${error ? "text-red-600" : "text-slate-500"}`;
  };
  const setResult = (value: string, label = "Result ready") => {
    output.value = value;
    meta.textContent = label;
    downloadBlob = new Blob([value], { type: "text/plain;charset=utf-8" });
    setStatus("Completed successfully.");
  };
  const field = (id: string, label: string, value: string, type = "text") => {
    const wrap = document.createElement("label");
    wrap.className = "block text-xs font-semibold text-slate-600";
    wrap.innerHTML = `${label}<input id="${id}" type="${type}" value="${value}" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400" /></label>`;
    extra.append(wrap);
  };
  const get = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "";
  const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] ?? c));
  const words = (s: string) => s.trim() ? s.trim().match(/\S+/gu) ?? [] : [];
  const loadScript = (src: string) => new Promise<void>((resolve,reject) => { const existing=document.querySelector<HTMLScriptElement>(`script[src="${src}"]`); if(existing){ if(existing.dataset.loaded==="true")resolve(); else {existing.addEventListener("load",()=>resolve(),{once:true});existing.addEventListener("error",()=>reject(new Error("A required library could not be loaded.")),{once:true});} return;} const script=document.createElement("script");script.src=src;script.async=true;script.onload=()=>{script.dataset.loaded="true";resolve();};script.onerror=()=>reject(new Error("A required library could not be loaded. Check your connection and try again."));document.head.append(script); });\n  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };

  const textTools = new Set(["case-converter","lorem-ipsum-generator","markdown-editor","remove-duplicate-lines","slug-generator","text-analyzer","text-cleaner","text-diff-checker","text-sorter","word-counter","keyword-density-checker","bio-generator","caption-generator","hashtag-generator","base64-converter","html-encoder-decoder","json-formatter","csv-to-json","json-to-csv","number-system-converter","unix-timestamp-converter","url-encoder-decoder","uuid-generator","xml-formatter","text-binary-converter","password-generator","password-strength-checker","qr-generator"]);
  if (textTools.has(slug)) {
    if (slug === "case-converter") field("case-mode","Conversion","UPPERCASE");
    if (slug === "lorem-ipsum-generator") { input.placeholder = "Optional: enter number of paragraphs (default 3)"; document.querySelector("#input-label")!.textContent = "Paragraph count (optional)"; }
    if (slug === "text-diff-checker") field("compare-text","Second text to compare","","text");
    if (slug === "number-system-converter") { field("from-base","From base","10","number"); field("to-base","To base","2","number"); }\n    if (slug === "bmi-calculator") { field("weight-kg","Weight (kg)","70","number"); field("height-cm","Height (cm)","175","number"); }\n    if (slug === "percentage-calculator") { field("percent-value","Percentage","15","number"); field("percent-total","Number","200","number"); }
    if (slug === "keyword-density-checker") field("keyword","Keyword to analyze","","text");\n    if (slug === "age-calculator") { input.type = "date"; input.placeholder = "Select your date of birth"; }
    if (slug === "password-generator") { field("pass-length","Password length","20","number"); field("pass-symbols","Include symbols","yes"); }
    if (slug === "qr-generator") input.placeholder = "Enter a URL or text to encode as a QR code.";
  }

  const runText = () => {
    const value = input.value;
    switch (slug) {
      case "case-converter": {
        const mode = get("case-mode");
        const result = mode === "UPPERCASE" ? value.toUpperCase() : mode === "lowercase" ? value.toLowerCase() : mode === "Title Case" ? value.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase()) : value.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, c => c.toUpperCase());
        return setResult(result);
      }
      case "lorem-ipsum-generator": {
        const n = Math.max(1, Math.min(20, Number(value) || 3));
        const sample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere, sapien at facilisis tincidunt, justo erat feugiat risus, vitae consequat nibh massa non erat.";
        return setResult(Array.from({length:n},(_,i)=>sample).join("\n\n"), `${n} paragraphs`);
      }
      case "markdown-editor": {
        const html = value.split("\n").map(line => line.startsWith("# ") ? `<h1>${escapeHtml(line.slice(2))}</h1>` : line.startsWith("## ") ? `<h2>${escapeHtml(line.slice(3))}</h2>` : line.startsWith("- ") ? `<p>• ${escapeHtml(line.slice(2))}</p>` : `<p>${escapeHtml(line).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>")}</p>`).join("");
        return setResult(html, "HTML preview source");
      }
      case "remove-duplicate-lines": { const lines=value.split(/\r?\n/); const seen=new Set<string>(); return setResult(lines.filter(line=>{const key=line.trim().toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).join("\n")); }
      case "slug-generator": return setResult(value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
      case "text-analyzer": { const w=words(value); const sentences=value.split(/[.!?]+/u).filter(s=>s.trim()).length; const paragraphs=value.split(/\n\s*\n/).filter(s=>s.trim()).length; return setResult([`Words: ${w.length}`,`Characters: ${value.length}`,`Characters (excluding spaces): ${value.replace(/\s/g,"").length}`,`Sentences (estimated): ${sentences}`,`Paragraphs: ${paragraphs}`,`Lines: ${value ? value.split(/\r?\n/).length : 0}`,`Reading time: ${Math.max(1,Math.ceil(w.length/200))} min at 200 WPM`].join("\n")); }
      case "text-cleaner": return setResult(value.replace(/[\t ]+/g," ").replace(/\s*\n\s*/g,"\n").replace(/\n{3,}/g,"\n\n").trim());
      case "text-diff-checker": { const b=get("compare-text").split(/\r?\n/), a=value.split(/\r?\n/); const max=Math.max(a.length,b.length); const out:string[]=[]; for(let i=0;i<max;i++){if(a[i]===b[i])out.push(`  ${a[i]??""}`);else{if(a[i]!==undefined)out.push(`- ${a[i]}`);if(b[i]!==undefined)out.push(`+ ${b[i]}`);}} return setResult(out.join("\n"), "Line-by-line comparison"); }
      case "text-sorter": return setResult(value.split(/\r?\n/).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:"base"})).join("\n"));
      case "word-counter": return setResult([`Words: ${words(value).length}`,`Characters: ${value.length}`,`Characters without spaces: ${value.replace(/\s/g,"").length}`,`Lines: ${value ? value.split(/\r?\n/).length : 0}`,`Paragraphs: ${value.split(/\n\s*\n/).filter(x=>x.trim()).length}`].join("\n"));
      case "keyword-density-checker": { const k=get("keyword").trim().toLowerCase(); if(!k)throw new Error("Enter a keyword in the Keyword field."); const total=words(value).length; const count=(value.toLowerCase().match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gu"))??[]).length; return setResult(`Keyword: ${k}\nOccurrences: ${count}\nTotal words: ${total}\nDensity: ${total ? (count/total*100).toFixed(2) : "0.00"}%\n\nNote: simple exact phrase count; not a search-engine ranking metric.`); }
      case "base64-converter": return setResult(value.startsWith("decode:") ? decodeURIComponent(escape(atob(value.slice(7).trim()))) : btoa(unescape(encodeURIComponent(value))));
      case "html-encoder-decoder": return setResult(value.startsWith("decode:") ? new DOMParser().parseFromString(value.slice(7),"text/html").documentElement.textContent ?? "" : escapeHtml(value));
      case "json-formatter": { const parsed=JSON.parse(value); return setResult(JSON.stringify(parsed,null,2)); }
      case "csv-to-json": { const lines=value.trim().split(/\r?\n/); if(lines.length<2)throw new Error("Provide a header row and at least one data row."); const parse=(line:string)=>line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x=>x.trim().replace(/^"|"$/g,"").replace(/""/g,'"')); const headers=parse(lines[0]); return setResult(JSON.stringify(lines.slice(1).map(line=>Object.fromEntries(parse(line).map((v,i)=>[headers[i]??`column${i+1}`,v]))),null,2)); }
      case "json-to-csv": { const data=JSON.parse(value); if(!Array.isArray(data)||!data.length||typeof data[0]!=="object")throw new Error("Input must be a non-empty JSON array of objects."); const headers=[...new Set(data.flatMap((row:Record<string,unknown>)=>Object.keys(row)))]; const cell=(v:unknown)=>{const s=String(v??"");return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}; return setResult([headers.map(cell).join(","),...data.map((row:Record<string,unknown>)=>headers.map(h=>cell(row[h])).join(","))].join("\n")); }
      case "number-system-converter": { const from=Number(get("from-base")),to=Number(get("to-base")); if(![2,8,10,16].includes(from)||![2,8,10,16].includes(to))throw new Error("Bases must be 2, 8, 10 or 16."); const n=BigInt(parseInt(value.trim(),from)); return setResult(n.toString(to).toUpperCase()); }
      case "unix-timestamp-converter": { const raw=Number(value.trim()); if(!Number.isFinite(raw))throw new Error("Enter a valid Unix timestamp or date string."); const d= /^\d+(\.\d+)?$/.test(value.trim()) ? new Date(raw*(raw>1e12?1:1000)) : new Date(value); if(Number.isNaN(d.getTime()))throw new Error("Could not parse this date."); return setResult(`ISO: ${d.toISOString()}\nLocal: ${d.toLocaleString()}\nUnix seconds: ${Math.floor(d.getTime()/1000)}\nUnix milliseconds: ${d.getTime()}`); }
      case "url-encoder-decoder": return setResult(value.startsWith("decode:") ? decodeURIComponent(value.slice(7)) : encodeURIComponent(value));
      case "uuid-generator": return setResult(Array.from({length:10},()=>crypto.randomUUID()).join("\n"),"10 UUID v4 identifiers");
      case "xml-formatter": { const doc=new DOMParser().parseFromString(value,"application/xml"); if(doc.querySelector("parsererror"))throw new Error("Invalid XML. Check tags and nesting."); const serializer=new XMLSerializer(); return setResult(serializer.serializeToString(doc).replace(/></g,">\n<")); }
      case "text-binary-converter": return setResult(value.startsWith("decode:") ? value.slice(7).trim().split(/\s+/).map(x=>String.fromCodePoint(parseInt(x,2))).join("") : Array.from(value).map(c=>c.codePointAt(0)!.toString(2).padStart(8,"0")).join(" "));
      case "password-generator": { const len=Math.max(8,Math.min(128,Number(get("pass-length"))||20)); const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+="; const random=new Uint32Array(len); crypto.getRandomValues(random); return setResult(Array.from(random,n=>chars[n%chars.length]).join(""),`${len} characters · generated with Web Crypto`); }
      case "password-strength-checker": { const score=[value.length>=12,value.length>=16,/[a-z]/.test(value)&&/[A-Z]/.test(value),/\d/.test(value),/[^A-Za-z0-9]/.test(value)].filter(Boolean).length; return setResult(`Estimated strength: ${["Very weak","Weak","Fair","Strong","Very strong","Excellent"][score]}\nLength: ${value.length}\nLowercase and uppercase: ${/[a-z]/.test(value)&&/[A-Z]/.test(value)?"Yes":"No"}\nNumbers: ${/\d/.test(value)?"Yes":"No"}\nSymbols: ${/[^A-Za-z0-9]/.test(value)?"Yes":"No"}\n\nThis is a local heuristic, not a breach or crack-time check.`); }
      case "qr-generator": throw new Error("Use the QR code preview control below to generate your code.");
      case "bio-generator": return setResult([`Creative: ${value} | Creating every day ✨`,`Professional: ${value} | Sharing ideas, experience and inspiration.`,`Minimal: ${value} • Create. Learn. Grow.`].join("\n\n"));
      case "caption-generator": return setResult([`A little moment, a lasting memory. ✨\n\n${value}`,`POV: You needed this today. 💫\n\n${value}`,`Good vibes, great moments. ❤️\n\n${value}`].join("\n\n---\n\n"));
      case "hashtag-generator": { const tags=value.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[]; const unique=[...new Set(tags)].filter(t=>t.length>2); return setResult([...unique,...["foryou","trending","contentcreator","explorepage","dailyinspiration"]].slice(0,20).map(t=>"#"+t).join(" "),"Suggested tags · review relevance before posting"); }
      case "age-calculator": { const dob = new Date(value); if(Number.isNaN(dob.getTime()) || dob > new Date()) throw new Error("Enter a valid date of birth in the past."); const now=new Date(); let years=now.getFullYear()-dob.getFullYear(), months=now.getMonth()-dob.getMonth(), days=now.getDate()-dob.getDate(); if(days<0){months--;days+=new Date(now.getFullYear(),now.getMonth(),0).getDate();} if(months<0){years--;months+=12;} return setResult(`${years} years, ${months} months and ${days} days`); }
      case "bmi-calculator": { const kg=Number(get("weight-kg")),cm=Number(get("height-cm")); if(!(kg>0&&cm>0))throw new Error("Enter a positive weight and height in the extra fields."); const bmi=kg/((cm/100)**2); const group=bmi<18.5?"Underweight":bmi<25?"Healthy range":bmi<30?"Overweight":"Obesity range"; return setResult(`BMI: ${bmi.toFixed(1)}\nCategory: ${group}\n\nBMI is a screening measure, not a diagnosis.`); }
      case "percentage-calculator": { const a=Number(get("percent-value")),b=Number(get("percent-total")); if(!Number.isFinite(a)||!Number.isFinite(b))throw new Error("Enter valid numbers in both fields."); return setResult(`${a}% of ${b} = ${(a/100*b).toLocaleString()}\n${a} is ${b===0?"undefined":(a/b*100).toFixed(2)+"%"} of ${b}`); }
      case "color-picker": { const hex=value.trim()||"#2563eb"; if(!/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex))throw new Error("Enter a valid 3- or 6-digit HEX color."); let h=hex.replace("#","");if(h.length===3)h=[...h].map(x=>x+x).join("");const n=parseInt(h,16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;const [rr,gg,bb]=[r,g,b].map(x=>x/255);const max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb),d=max-min;let hue=0;if(d){if(max===rr)hue=((gg-bb)/d)%6;else if(max===gg)hue=(bb-rr)/d+2;else hue=(rr-gg)/d+4;hue=Math.round(hue*60);if(hue<0)hue+=360;}const light=(max+min)/2,sat=d?Math.round(d/(1-Math.abs(2*light-1))*100):0;return setResult(`HEX: #${h.toUpperCase()}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${hue}, ${sat}%, ${Math.round(light*100)}%)`); }
      case "gradient-generator": { const colors=value.match(/#[0-9a-f]{3,8}/gi)??[]; if(colors.length<2)throw new Error("Enter at least two HEX colors, e.g. #2563eb, #9333ea."); const css=`background: linear-gradient(135deg, ${colors.join(", ")});`;return setResult(css); }
      default: throw new Error("This tool is not implemented yet.");
    }
  };

  run.addEventListener("click", async () => {
    try {
      if (["image-compressor","image-converter","image-cropper","image-resizer","images-to-pdf","pdf-to-images","typing-speed-test","text-to-speech"].includes(slug)) {
        await runSpecial();
      } else {
        if (!input.value.trim() && !["uuid-generator","lorem-ipsum-generator","age-calculator","bmi-calculator","percentage-calculator"].includes(slug)) throw new Error("Please enter some input first.");
        runText();
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : "Something went wrong.", true); }
  });

  async function runSpecial() {
    if (["image-compressor","image-converter","image-cropper","image-resizer","images-to-pdf","pdf-to-images"].includes(slug)) {
      const file = (document.querySelector<HTMLInputElement>("#file-input")?.files?.[0]);
      if (!file) throw new Error("Choose an image file first.");
      const img = new Image(); const url=URL.createObjectURL(file);
      await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error("Could not open this image."));img.src=url;});
      const canvas=document.createElement("canvas"); const ctx=canvas.getContext("2d"); if(!ctx)throw new Error("Canvas is unavailable.");
      const width=Math.max(1,Number(get("image-width"))||img.width),height=Math.max(1,Number(get("image-height"))||img.height);
      canvas.width=slug==="image-cropper"?Math.min(img.width,width):width; canvas.height=slug==="image-cropper"?Math.min(img.height,height):height;
      if(slug==="image-cropper")ctx.drawImage(img,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);else ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const type=slug==="image-converter"?(get("image-format")||"image/png"): "image/jpeg";
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Image export failed.")),type,0.82));
      downloadBlob=blob; output.value=`Original: ${img.width} × ${img.height}\nOutput: ${canvas.width} × ${canvas.height}\nOriginal size: ${file.size.toLocaleString()} bytes\nOutput size: ${blob.size.toLocaleString()} bytes\n\nUse Download to save the processed image.`; meta.textContent="Image processed"; setStatus("Image processed locally. Use Download to save it."); (download as HTMLButtonElement).dataset.filename="toolora-image";
      URL.revokeObjectURL(url); (download as HTMLButtonElement).dataset.image="true"; return;
    }
    if(slug==="text-to-speech") { if(!("speechSynthesis" in window))throw new Error("Speech synthesis is not supported in this browser."); speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(input.value)); setStatus("Speech playback started using your browser voice."); return; }
    if(slug==="typing-speed-test") { if(!typingStarted){typingStarted=Date.now();setStatus("Timer started. Type the displayed sample into the input.");input.placeholder="Start typing the sample text here...";return;} const mins=(Date.now()-typingStarted)/60000;const wpm=Math.round(words(input.value).length/Math.max(mins,.01));return setResult(`Elapsed: ${Math.round((Date.now()-typingStarted)/1000)} seconds\nWords per minute: ${wpm}\nCharacters: ${input.value.length}`); }
    throw new Error("This file conversion mode is not enabled yet.");
  }

  if(["image-compressor","image-converter","image-cropper","image-resizer"].includes(slug)) {
    input.classList.add("hidden");
    const fileLabel=document.createElement("label");fileLabel.className="block text-sm font-bold mb-2";fileLabel.textContent=slug==="images-to-pdf"?"Choose images":slug==="pdf-to-images"?"Choose PDF":"Choose image";
    const file=document.createElement("input");file.type="file";file.accept=slug==="pdf-to-images"?"application/pdf":"image/*";file.multiple=slug==="images-to-pdf";file.id="file-input";file.className="block w-full rounded-xl border border-slate-200 p-3 text-sm";
    document.querySelector("#input-label")!.replaceWith(fileLabel);fileLabel.append(file);
    field("image-width","Output width (px)","1200","number");field("image-height","Output height (px)","800","number");
    if(slug==="image-converter")field("image-format","Output format","image/png");
  }
  if(slug==="qr-generator"){ input.placeholder="Enter a URL or text to encode."; const preview=document.createElement("div");preview.id="qr-preview";preview.className="mt-5 flex justify-center";extra.append(preview); }\n  if(slug==="text-to-speech")input.placeholder="Enter the text you want to hear.";
  if(slug==="typing-speed-test")input.placeholder="Click Run tool to start, then type your text and click again.";
  copy.addEventListener("click", async()=>{if(!output.value){setStatus("There is no result to copy.",true);return;}try{await navigator.clipboard.writeText(output.value);setStatus("Result copied to clipboard.");}catch{setStatus("Clipboard access was blocked by the browser.",true);}});
  download.addEventListener("click",()=>{if(downloadBlob){downloadFile(downloadBlob, (download as HTMLButtonElement).dataset.filename ?? `toolora-${slug}.txt`);return;}if(!output.value){setStatus("There is no result to download.",true);return;}downloadFile(new Blob([output.value],{type:"text/plain;charset=utf-8"}),`toolora-${slug}.txt`);});
  reset.addEventListener("click",()=>{input.value="";output.value="";extra.querySelectorAll("input").forEach(el=>{if(el instanceof HTMLInputElement)el.value=el.defaultValue;});downloadBlob=null;typingStarted=0;meta.textContent="Waiting for input";setStatus("Ready for new input.");});
}
