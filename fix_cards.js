const fs = require('fs');
let html = fs.readFileSync('temas.html', 'utf8');

// Use safer tailwind classes that play nicely with theme-applier.js overrides
html = html.replaceAll('bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl', 'bg-slate-100 dark:bg-[#0f172a] backdrop-blur-sm relative overflow-hidden z-10');

// Fix Vista Previa missing upgrade
html = html.replace('bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 fade-up sticky top-28', 'bg-slate-100 dark:bg-[#0f172a] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-slate-800/60 fade-up sticky top-28 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]');

// Also ensure theme-applier doesn't completely override it awkwardly by using specific tailwind class
// dark:bg-[#0f172a] directly sets the dark mode color!

fs.writeFileSync('temas.html', html);
