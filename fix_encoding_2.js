const fs = require('fs');
const files = [
  'historial.html',
  'perfil_miembro.html'
];
files.forEach(f => {
  let utf8 = fs.readFileSync(f, 'utf8');
  
  // Replace the default phone value
  utf8 = utf8.replace(/<span id="trainerPhone" class="font-extrabold text-slate-700">\uFFFD<\/span>/g, '<span id="trainerPhone" class="font-extrabold text-slate-700">—</span>');

  // Fix perfil_miembro.html default --
  // Let's also check if it contains \uFFFD in the JS
  utf8 = utf8.replace(/const phoneValue = userData.phone \|\| [^;]+;/g, `const phoneValue = userData.phone || userData.telefono || userData.celular || userData.cel || '—';`);

  fs.writeFileSync(f, utf8, 'utf8');
});
console.log('Fixed REPLACEMENT CHARACTER in HTML files.');
