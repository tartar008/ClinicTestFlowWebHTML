(async function () {
    await DB.ready();
    renderSidebar('treatment');

    const rows = document.getElementById('rows');
    const q = document.getElementById('q');
    let compact = false;

    const render = () => {
        const db = DB.get();
        const term = (q.value || '').toLowerCase();

        const list = db.treatments.filter(t => {
            const pet = DB.findPet(t.petId) || {};
            const owner = DB.findOwner(pet.ownerId) || {};
            const s = `${pet.id} ${pet.name} ${t.diagnosis || ''} ${t.plan || ''} ${t.drugs || ''} ${owner.name || ''}`.toLowerCase();
            return !term || s.includes(term);
        });

        rows.innerHTML = list.map((t, idx) => {
            const p = DB.findPet(t.petId) || {};
            const o = DB.findOwner(p.ownerId) || {};
            return `<tr class="border-b last:border-0 ${compact ? 'text-xs' : ''}">
        <td class="py-2 px-2">${idx + 1}</td>
        <td class="py-2 px-2">${p.name || '-'}</td>
        <td class="py-2 px-2">${p.id || '-'}</td>
        <td class="py-2 px-2">${o.name || '-'}</td>
        <td class="py-2 px-2">${fmtDateTime(t.date)}</td>
        <td class="py-2 px-2">${t.symptoms || '-'}</td>
        <td class="py-2 px-2"><span class="px-2 py-0.5 rounded text-xs ${t.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}">${t.status}</span></td>
        <td class="py-2 px-2">
          <button data-edit="${t.id}" class="btn">บันทึก/แก้ไข</button>
        </td>
      </tr>`;
        }).join('') || `<tr><td class="py-3 px-2" colspan="8">ยังไม่มีข้อมูล</td></tr>`;
    };

    render();
    document.getElementById('btnSearch').onclick = render;
    document.getElementById('btnCompact').onclick = () => { compact = !compact; render(); };

    // New
    document.getElementById('btnNew').onclick = () => {
        fillPetOptions();
        txPet.value = '';
        txSymptoms.value = '';
        txDiagnosis.value = '';
        txPlan.value = '';
        txDrugs.value = '';
        txNext.value = '';
        txStatus.value = 'เสร็จสิ้น';
        dlg.showModal();
    };

    function fillPetOptions() {
        const pets = DB.get().pets;
        txPet.innerHTML = `<option value="">-- เลือกสัตว์เลี้ยง --</option>` +
            pets.map(p => `<option value="${p.id}">#${p.id} · ${p.name} (${DB.findOwner(p.ownerId)?.name || '-'})</option>`).join('');
    }

    btnSave.onclick = (ev) => {
        ev.preventDefault();
        const petId = +txPet.value;
        if (!petId) return alert('เลือกสัตว์เลี้ยง');

        const rec = {
            id: DB.nextId('treatments'),
            petId,
            symptoms: txSymptoms.value.trim(),
            diagnosis: txDiagnosis.value.trim(),
            plan: txPlan.value.trim(),
            drugs: txDrugs.value.trim(),
            nextDate: txNext.value || null,
            status: txStatus.value,
            date: new Date().toISOString(),
        };
        DB.update(db => {
            db.treatments.push(rec);
            const p = db.pets.find(x => x.id === petId);
            if (p && rec.status === 'เสร็จสิ้น') p.status = 'รักษาเสร็จ';
        });
        dlg.close();
        render();
    };
})();
