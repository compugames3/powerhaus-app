const fs = require('fs');
let html = fs.readFileSync('temas.html', 'utf8');

// Modernize Body and Main backgrounds
html = html.replace('<body class="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex transition-colors duration-300">', '<body class="bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 min-h-screen flex transition-colors duration-300 relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] before:from-blue-100/50 before:via-transparent before:to-transparent before:pointer-events-none dark:before:from-blue-900/20">');

html = html.replace('<main class="flex-1 overflow-y-auto">', '<main class="flex-1 overflow-y-auto relative z-10">');

// Modernize Header
html = html.replace('bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60', 'bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/50 dark:border-slate-800/50 shadow-sm');
html = html.replace('bg-[#004cf0] hover:bg-[#0038b6] text-white px-5 py-2 font-black text-xs tracking-widest uppercase shadow-lg shadow-blue-500/25 active:scale-95 transition-all" style="border-radius: 12px !important;"', 'bg-gradient-to-r from-[#004cf0] to-[#0038b6] hover:from-[#0038b6] hover:to-[#002894] text-white px-6 py-2.5 font-black text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_16px_-6px_rgba(0,76,240,0.4)] active:scale-95 transition-all rounded-xl border border-blue-400/20"');
html = html.replace('border border-slate-200 dark:border-slate-700 px-4 py-2 hover:bg-slate-50', 'border border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-5 py-2.5 hover:bg-slate-50 shadow-sm');

// Modernize Sections (replace all base card classes)
html = html.replaceAll('bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-sm border border-slate-100 dark:border-slate-800 fade-up', 'bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-slate-800/60 fade-up transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]');

// Vista Previa changes
html = html.replace('class="preview-sidebar" style="background:#f4f6fa;"', 'class="preview-sidebar shadow-[0_0_0_4px_rgba(255,255,255,0.5),0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_4px_rgba(30,41,59,0.5),0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-700/50" style="background:#f8fafc;"');

// Preset cards
html = html.replace('bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white fade-up', 'bg-[url(\'https://www.transparenttextures.com/patterns/cubes.png\')] bg-blue-600 relative overflow-hidden rounded-[2rem] p-7 text-white fade-up shadow-[0_16px_32px_-12px_rgba(37,99,235,0.4)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-600/90 before:to-indigo-900/90 before:z-0');
html = html.replace('id="presetThemes"', 'id="presetThemes" class="relative z-10 flex flex-col gap-3"');
html = html.replace('<div class="flex items-center gap-2 mb-3">', '<div class="flex items-center gap-2 mb-5 relative z-10">');
html = html.replace('bg-white/10 hover:bg-white/20 rounded-xl', 'bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10');

// Typography section enhancements
html = html.replace('font-opt py-3 px-4 rounded-2xl text-sm border-2 transition-all text-left font-bold', 'font-opt py-4 px-5 rounded-[1.25rem] text-sm border-2 transition-all text-left font-extrabold tracking-tight hover:shadow-md');

fs.writeFileSync('temas.html', html);
