(async function () {
    await DB.ready();
    renderSidebar('inventory');

    const cards = document.getElementById('cards');
    const tabs = Array.from(document.querySelectorAll('[data-cat]'));
    let cat = 'ยา';
    let editingId = null;

    tabs.forEach(b => {
        b.onclick = () => {
            cat = b.dataset.cat;
            tabs.forEach(x => x.classList.toggle('tag-active', x === b));
            render();
        };
    });

    const render = () => {
        const list = DB.get().inventory.filter(i => i.type === cat);
        cards.innerHTML = list.map(i => {
            const ok = i.qty > 0 && (!i.expire || new Date(i.expire) > new Date());
            return `<div class="border rounded-xl bg-white p-4">
        <div class="font-semibold text-lg">${i.name}</div>
        <div class="text-sm">ประเภท: ${i.type}</div>
        <div class="text-sm">รหัส: ${i.id}</div>
        <div class="text-sm">จำนวนคงเหลือ: <b>${i.qty}</b></div>
        <div class="text-sm">วันที่รับเข้า: ${i.arrive ? fmtDate(i.arrive) : '-'}</div>
        <div class="text-sm">วันหมดอายุ: ${i.expire ? fmtDate(i.expire) : '-'}</div>
        <div class="mt-2 text-sm">สถานะ: <span class="px-2 py-0.5 rounded text-xs ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${ok ? 'เพียงพอ' : 'ไม่เพียงพอ'}</span></div>
        <div class="mt-3 flex gap-2">
          <button data-edit="${i.id}" class="btn">แก้ไข</button>
          <button data-del="${i.id}" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm">ลบ</button>
        </div>
      </div>`;
        }).join('') || `<div class="text-slate-500">ยังไม่มีข้อมูล</div>`;
    };

    render();

    // New
    document.getElementById('btnNew').onclick = () => {
        editingId = null;
        itType.value = cat;
        itCode.value = '';
        itName.value = '';
        itQty.value = '';
        itArrive.value = '';
        itExpire.value = '';
        dlg.showModal();
    };

    cards.addEventListener('click', (e) => {
        const id = e.target.dataset.edit || e.target.dataset.del;
        if (!id) return;

        if (e.target.dataset.edit) {
            const i = DB.get().inventory.find(x => x.id === id);
            editingId = id;
            itCode.value = i.id;
            itName.value = i.name;
            itType.value = i.type;
            itQty.value = i.qty;
            itArrive.value = i.arrive || '';
            itExpire.value = i.expire || '';
            dlg.showModal();
        } else if (e.target.dataset.del) {
            if (confirm('ลบรายการนี้?')) {
                DB.update(db => { db.inventory = db.inventory.filter(x => x.id !== id); });
                render();
            }
        }
    });

    btnSave.onclick = (ev) => {
        ev.preventDefault();
        const rec = {
            id: itCode.value.trim(),
            name: itName.value.trim(),
            type: itType.value,
            qty: +itQty.value || 0,
            arrive: itArrive.value || null,
            expire: itExpire.value || null,
        };
        if (!rec.id || !rec.name) return alert('กรอกรหัสและชื่อให้ครบ');

        DB.update(db => {
            const i = db.inventory.findIndex(x => x.id === rec.id);
            if (i >= 0) db.inventory[i] = rec;
            else db.inventory.push(rec);
        });
        dlg.close();
        render();
    };
})();
