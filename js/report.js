(async function () {
    await DB.ready();
    renderSidebar('report');

    const cards = document.getElementById('cards');
    const q = document.getElementById('q');
    const from = document.getElementById('dateFrom');
    const to = document.getElementById('dateTo');

    const render = () => {
        const db = DB.get();
        const term = (q.value || '').toLowerCase();
        const tFrom = from.value ? new Date(from.value) : null;
        const tTo = to.value ? new Date(to.value) : null;

        const list = db.treatments.filter(t => {
            const pet = DB.findPet(t.petId) || {};
            const owner = DB.findOwner(pet.ownerId) || {};
            const s = `${pet.name || ''} ${owner.name || ''} ${t.diagnosis || ''} ${t.plan || ''} ${t.drugs || ''}`.toLowerCase();
            if (term && !s.includes(term)) return false;
            const d = new Date(t.date);
            if (tFrom && d < tFrom) return false;
            if (tTo && d > new Date(tTo.getTime() + 86400000 - 1)) return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        cards.innerHTML = list.map(t => {
            const p = DB.findPet(t.petId) || {};
            const o = DB.findOwner(p.ownerId) || {};
            return `<div class="border rounded-xl bg-white p-4">
        <div class="text-sm text-slate-500">${fmtDateTime(t.date)} · Pet ID: ${p.id}</div>
        <div class="mt-1 font-semibold">${p.name || '-'}</div>
        <div class="text-sm">เจ้าของ: ${o.name || '-'}</div>
        <div class="mt-2 text-sm"><b>การวินิจฉัย:</b> ${t.diagnosis || '-'}</div>
        <div class="text-sm"><b>การรักษา:</b> ${t.plan || '-'}</div>
        <div class="text-sm"><b>ยา:</b> ${t.drugs || '-'}</div>
        <div class="mt-2 text-sm"><b>นัดครั้งต่อไป:</b> ${t.nextDate ? fmtDate(t.nextDate) : '-'}</div>
      </div>`;
        }).join('') || `<div class="text-slate-500">ไม่พบข้อมูลตามเงื่อนไข</div>`;
    };

    render();
    document.getElementById('btnSearch').onclick = () => { q.value = ''; from.value = ''; to.value = ''; render(); };

    document.getElementById('btnCSV').onclick = () => {
        const db = DB.get();
        const lines = [['date', 'petId', 'petName', 'owner', 'diagnosis', 'plan', 'drugs', 'nextDate']];
        db.treatments.forEach(t => {
            const p = DB.findPet(t.petId) || {};
            const o = DB.findOwner(p.ownerId) || {};
            lines.push([fmtDateTime(t.date), p.id, p.name || '', o.name || '', t.diagnosis || '', t.plan || '', t.drugs || '', t.nextDate || '']);
        });
        const csv = lines.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `meowclinic-report-${Date.now()}.csv`;
        a.click();
    };
})();
