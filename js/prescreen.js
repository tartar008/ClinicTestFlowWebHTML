(async function () {
    await DB.ready();
    renderSidebar('prescreen');

    const rows = document.getElementById('rows');
    const q = document.getElementById('q');
    let currentPetId = null;

    const render = () => {
        const db = DB.get();
        const term = (q.value || '').toLowerCase();
        const list = db.pets.filter(p => {
            const o = DB.findOwner(p.ownerId);
            const s = `${p.name} ${p.id} ${p.species} ${o?.name || ''} ${o?.phone || ''} ${o?.email || ''}`.toLowerCase();
            return (!term || s.includes(term));
        });

        rows.innerHTML = list.map((p, idx) => {
            const o = DB.findOwner(p.ownerId) || {};
            return `<tr class="border-b last:border-0">
        <td class="py-2 px-2">${idx + 1}</td>
        <td class="py-2 px-2 text-blue-600">${p.name}</td>
        <td class="py-2 px-2">${p.id}</td>
        <td class="py-2 px-2">${p.species || '-'}</td>
        <td class="py-2 px-2">${o.name || '-'}</td>
        <td class="py-2 px-2">${o.phone || '-'}</td>
        <td class="py-2 px-2">${o.email || '-'}</td>
        <td class="py-2 px-2">
          <button data-ps="${p.id}" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">บันทึก Pre-screen</button>
        </td>
      </tr>`;
        }).join('') || `<tr><td class="py-3 px-2" colspan="8">ยังไม่มีข้อมูล</td></tr>`;
    };

    render();
    document.getElementById('btnSearch').onclick = render;

    // if query pet=? open form
    const params = new URLSearchParams(location.search);
    if (params.get('pet')) {
        currentPetId = +params.get('pet');
        openForm(currentPetId);
    }

    function openForm(petId) {
        const p = DB.findPet(+petId);
        const o = DB.findOwner(p.ownerId);
        petInfo.innerHTML = `
      <div class="grid md:grid-cols-2 gap-2">
        <div>รหัสสัตว์: <b>${p.id}</b> · สายพันธุ์: ${p.species || '-'} · ชื่อ: <b>${p.name}</b></div>
        <div>เจ้าของ: <b>${o?.name || '-'}</b> · แพ้อาหาร/วัคซีน: —</div>
      </div>`;
        dlg.showModal();
    }

    rows.addEventListener('click', (e) => {
        const petId = e.target.dataset.ps;
        if (petId) { currentPetId = +petId; openForm(petId); }
    });

    btnSavePS.onclick = (ev) => {
        ev.preventDefault();
        if (!currentPetId) return;
        const rec = {
            id: crypto.randomUUID(),
            petId: currentPetId,
            temperature: psTemp.value.trim(),
            bpm: psBpm.value.trim(),
            symptoms: psSym.value.trim(),
            eat: psEat.value,
            general: psGeneral.value,
            date: new Date().toISOString()
        };
        DB.update(db => {
            db.prescreens.push(rec);
            const p = db.pets.find(x => x.id === currentPetId);
            if (p) p.status = 'Pre-screened';
        });
        dlg.close();
        render();
    };
})();
