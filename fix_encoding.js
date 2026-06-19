const fs = require('fs');
const files = [
  'editar_usuario.html',
  'editar_entrenador.html',
  'historial.html',
  'perfil_miembro.html'
];
files.forEach(f => {
  let utf8 = fs.readFileSync(f, 'utf8');
  
  // Fix placeholders in editar_usuario and editar_entrenador
  utf8 = utf8.replace(/placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"/g, 'placeholder="••••••••"');
  utf8 = utf8.replace(/placeholder="\?\?\?\?\?\?\?\?"/g, 'placeholder="••••••••"');
  utf8 = utf8.replace(/placeholder="Contrasea"/g, 'placeholder="Contraseña"');
  utf8 = utf8.replace(/placeholder="Contrasea"/g, 'placeholder="Contraseña"');
  
  // Fix historial.html
  utf8 = utf8.replace(/<span class="block text-\[10px\] font-bold text-slate-400 tracking-widest uppercase mb-1">TELFONO<\/span>/g, '<span class="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">TELÉFONO</span>');
  utf8 = utf8.replace(/<span class="block text-\[10px\] font-bold text-slate-400 tracking-widest uppercase mb-1">TELFONO<\/span>/g, '<span class="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">TELÉFONO</span>');
  
  // Replace the default phone value
  utf8 = utf8.replace(/<span id="trainerPhone" class="font-extrabold text-slate-700">\?<\/span>/g, '<span id="trainerPhone" class="font-extrabold text-slate-700">—</span>');
  utf8 = utf8.replace(/<span id="trainerPhone" class="font-extrabold text-slate-700"><\/span>/g, '<span id="trainerPhone" class="font-extrabold text-slate-700">—</span>');

  // Fix perfil_miembro.html default phone value
  utf8 = utf8.replace(/document.getElementById\('profilePhone'\).innerText = phoneValue \|\| '';/g, "document.getElementById('profilePhone').innerText = phoneValue || '—';");
  utf8 = utf8.replace(/document.getElementById\('profilePhone'\).innerText = phoneValue \|\| '\?';/g, "document.getElementById('profilePhone').innerText = phoneValue || '—';");

  fs.writeFileSync(f, utf8, 'utf8');
});
console.log('Fixed encoding issues in HTML files.');
