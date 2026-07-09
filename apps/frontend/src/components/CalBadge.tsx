import { useEffect } from 'react'

declare global {
  interface Window {
    Cal?: any
  }
}

export default function CalBadge() {
  useEffect(() => {
    // Cal.com Global Embed Code
    (function (C, A, L) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = d.createElement("script");
          script.src = A;
          script.async = true;
          d.head.appendChild(script);
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    // Initialize Cal
    window.Cal("init", { origin: "https://app.cal.com" });

    // Setup global UI config for popups
    window.Cal("ui", {
      theme: "dark",
      styles: {
        branding: {
          brandColor: "#C9A84C"
        }
      }
    });

    return () => {
      // Clean up the added scripts
      const scripts = document.head.querySelectorAll("script");
      scripts.forEach(s => {
        if (s.src.includes("cal.com/embed/embed.js")) s.remove();
      });
    };
  }, [])

  return null
}
