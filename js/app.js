// js/app.js
window.fmtDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString();
};
window.fmtDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleString();
};
window.el = (sel) => document.querySelector(sel);
window.badgeClass = (status) =>
    status === 'Pre-screen'
        ? 'bg-amber-100 text-amber-800'
        : status === 'Pre-screened'
            ? 'bg-blue-100 text-blue-700'
            : status === 'รักษาเสร็จ'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700';

const link = (href, text, active) =>
    `<a href="${href}" class="flex items-center gap-2 px-4 py-2 rounded-lg ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}">
     <span>${text}</span>
   </a>`;

window.renderSidebar = (active) => {
    document.getElementById('sidebar').innerHTML = `
    <div class="p-4 border-b">
      <div class="font-bold text-lg">💙 MeowClinic</div>
      <div class="text-xs text-slate-500">Pet Health System</div>
    </div>
    <nav class="p-3 space-y-1">
      ${link('index.html', 'Dashboard', active === 'dashboard')}
      ${link('medical.html', 'Medical', active === 'medical')}
      ${link('prescreen.html', 'Pre-screen', active === 'prescreen')}
      ${link('treatment.html', 'Treatment', active === 'treatment')}
      ${link('report.html', 'Report', active === 'report')}
      <div class="px-4 text-slate-500 text-xs mt-3">Inventory</div>
      ${link('inventory.html', 'Treatment Item', active === 'inventory')}
      ${link('service.html', 'Service', active === 'service')}
    </nav>
    <div class="p-3 mt-auto">
      <a class="block text-center text-sm text-slate-500 hover:text-slate-700" href="#" onclick="localStorage.clear(); location.reload()">ล้างข้อมูล (local)</a>
    </div>
  `;
};

// Small CSS helpers via JS (Tailwind-like classes used in HTML)
const style = document.createElement('style');
style.textContent = `
  .input{ @apply border rounded-lg px-3 py-2 outline-none w-full focus:ring-2 focus:ring-slate-200; }
  .btn{ @apply px-3 py-2 rounded-lg border bg-white text-slate-700 hover:bg-slate-50; }
  .tag{ @apply px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50; }
  .tag-active{ @apply bg-slate-900 text-white border-slate-900; }
  dialog.modal::backdrop{ background:#0006; }
  dialog.modal{ border:0; border-radius:12px; padding:0; }
  dialog .modal-box{ padding:1rem 1rem 1.25rem; }
`;
document.head.appendChild(style);
