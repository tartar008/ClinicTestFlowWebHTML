(async function () {
    await DB.ready();
    renderSidebar('medical');

    const rows = document.getElementById('rows');
    const q = document.getElementById('q');

    const openForm = () => dlg.showModal();

    document.getElementById('btnNew').onclick = openForm;

    const render = () => {
        const db = DB.get();
        const term = (q.value || '').toLowerCase();
        const filtered = db.pets.filter(p => {
            const o = DB.findOwner(p.ownerId);
            const s = `${p.id} ${p.name} ${p.species} ${o?.name || ''} ${o?.phone || ''} ${o?.email || ''}`.toLowerCase();
            return !term || s.includes(term);
        });

        rows.innerHTML = filtered.map((p, idx) => {
            const o = DB.findOwner(p.ownerId) || {};
            return `<tr class="border-b last:border-0">
        <td class="py-2 px-2">${idx + 1}</td>
        <td class="py-2 px-2">${o.name || '-'}</td>
        <td class="py-2 px-2">${o.phone || '-'}</td>
        <td class="py-2 px-2">${o.email || '-'}</td>
        <td class="py-2 px-2 text-blue-600">${p.name}</td>
        <td class="py-2 px-2">${p.id}</td>
        <td class="py-2 px-2">${p.species || '-'}</td>
        <td class="py-2 px-2"><span class="px-2 py-0.5 rounded text-xs ${badgeClass(p.status)}">${p.status}</span></td>
        <td class="py-2 px-2">
          <a class="btn" href="prescreen.html?pet=${p.id}">บันทึก Pre-screen</a>
        </td>
      </tr>`;
        }).join('') || `<tr><td class="py-3 px-2" colspan="9">ยังไม่มีข้อมูล</td></tr>`;
    };

    render();
    document.getElementById('btnSearch').onclick = render;

    // Save new registration
    btnSave.onclick = (ev) => {
        ev.preventDefault();
        const owner = {
            id: DB.nextId('owners'),
            name: ownerName.value.trim() || 'Unknown Owner',
            phone: ownerPhone.value.trim() || '-',
            email: ownerEmail.value.trim() || '-',
        };
        const pet = {
            id: DB.nextId('pets'),
            name: petName.value.trim() || 'Unknown Pet',
            species: petSpecies.value.trim() || '-',
            sex: petSex.value || '-',
            age: +petAge.value || null,
            color: petColor.value.trim() || '',
            ownerId: owner.id,
            status: 'Pre-screen',
        };
        DB.update(db => {
            db.owners.push(owner);
            db.pets.push(pet);
        });
        dlg.close();
        render();
    };
})();
