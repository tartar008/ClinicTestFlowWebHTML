// js/data.js
const KEY = 'meowclinic.db.v1';

const defaultDB = {
    owners: [
        { id: 1, name: 'Somchai Jaidee', phone: '0812345678', email: 'somchai@example.com' },
        { id: 2, name: 'fareeda mama', phone: '0819876543', email: 'fadaa@gmail.com' },
    ],
    pets: [
        { id: 10, name: 'Happy', species: 'Shiba', ownerId: 1, sex: 'Male', age: 3, color: 'Brown', status: 'Pre-screen' },
        { id: 9, name: 'Milo', species: '—', ownerId: 2, sex: 'Male', age: 2, color: 'White', status: 'Pre-screen' },
        { id: 8, name: 'Lucky', species: 'Siamese', ownerId: 1, sex: 'Male', age: 3, color: 'Cream', status: 'Pre-screen' },
    ],
    prescreens: [],
    treatments: [],
    inventory: [
        { id: 'D001', name: 'Paracetamol', type: 'ยา', qty: 0, arrive: '2025-07-01', expire: '2026-06-30' },
        { id: 'D002', name: 'Amoxicillin', type: 'ยา', qty: 2, arrive: '2025-06-01', expire: '2025-12-01' },
        { id: 'D003', name: 'Ibuprofen', type: 'ยา', qty: 40, arrive: '2025-03-12', expire: '2026-02-28' },
        { id: 'M001', name: 'Alcohol Pads', type: 'เวชภัณฑ์', qty: 100, arrive: '2025-02-01', expire: '2027-02-01' },
        { id: 'V001', name: 'Rabies Vaccine', type: 'วัคซีน', qty: 20, arrive: '2025-01-15', expire: '2026-01-15' },
    ],
    services: [
        { id: 'E001', name: 'เครื่องอัลตราซาวด์', qty: 1, status: 'พร้อมใช้งาน' },
        { id: 'E002', name: 'เครื่องตรวจเลือด', qty: 2, status: 'พร้อมใช้งาน' },
    ]
};

const loadFromLocal = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
    catch { return null; }
};

const saveToLocal = (db) => localStorage.setItem(KEY, JSON.stringify(db));

const mergeSeed = (base, extra) => {
    if (!extra) return base;
    const mergeArr = (a, b, key) => {
        const map = new Map(a.map(x => [x[key], x]));
        b.forEach(x => map.set(x[key], { ...map.get(x[key]) || {}, ...x }));
        return [...map.values()];
    };
    return {
        owners: mergeArr(base.owners, extra.owners || [], 'id'),
        pets: mergeArr(base.pets, extra.pets || [], 'id'),
        prescreens: mergeArr(base.prescreens, extra.prescreens || [], 'id'/*none*/),
        treatments: mergeArr(base.treatments, extra.treatments || [], 'id'),
        inventory: mergeArr(base.inventory, extra.inventory || [], 'id'),
        services: mergeArr(base.services, extra.services || [], 'id'),
    };
};

const tryFetchJson = async () => {
    try {
        const res = await fetch('data/db.json', { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
};

window.DB = {
    _ready: (async () => {
        const local = loadFromLocal();
        if (local) { this.db = local; return; }
        const ext = await tryFetchJson();
        const seeded = mergeSeed(defaultDB, ext);
        saveToLocal(seeded);
        this.db = seeded;
    })(),

    ready() { return this._ready; },

    get() { return JSON.parse(localStorage.getItem(KEY)); },
    set(db) { saveToLocal(db); },

    update(mutator) {
        const db = this.get();
        mutator(db);
        this.set(db);
    },

    nextId(coll, field = 'id') {
        const arr = this.get()[coll];
        const max = arr.reduce((m, x) => Math.max(m, +x[field] || 0), 0);
        return max + 1;
    },

    findOwner(id) { return this.get().owners.find(o => o.id === id); },
    findPet(id) { return this.get().pets.find(p => p.id === id); }
};
