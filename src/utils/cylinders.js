import { initDB, STORE_CYLINDERS } from "../db.js";

export function normalizeGasCylinder(c) {
  return {
    id: c?.id || 1,
    name: String(c?.name) || "N/A",
    capacity: String(c?.capacity) || "6",
    capacityUnit: c?.capacityUnit || "kg",
    quantity: parseInt(c?.quantity) || 1,
    empty: parseInt(c?.empty) || 0,
    full: parseInt(c?.full) || 1,
  };
}

// --- CYLINDERS STORE ---
export async function addCylinder(cylinder) {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);
  await store.add(cylinder);
  await tx.done;
  return normalizeGasCylinder(cylinder);
}

export async function getCylinders() {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readonly");
  const store = tx.objectStore(STORE_CYLINDERS);
  const all = await store.getAll();
  await tx.done;
  return all.map(normalizeGasCylinder).reverse();
}
export async function getCylinderById(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readonly");
  const store = tx.objectStore(STORE_CYLINDERS);
  const c = await store.get(Number(id));
  await tx.done;
  return normalizeGasCylinder(c);
}
export async function updateCylinderQuantity(id, delta) {
  delta = parseInt(delta);
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);
  const all = await store.getAll();
  const cylinder = all.find((c) => c.id === id);
  if (!cylinder) throw new Error("Cylinder not found");
  cylinder.quantity = Math.max(0, cylinder.quantity + delta);
  await store.put(cylinder);
  await tx.done;
  return normalizeGasCylinder(cylinder);
}

export async function deleteCylinder(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);
  const all = await store.getAll();
  const target = all.find((c) => c.id === id);
  if (target) await store.delete(target.id);
  await tx.done;
  return true;
}
export async function refillGas(id, quantity) {
  id = Number(id);
  quantity = Number(quantity);

  const c = await getCylinderById(id);
  if (!c) throw new Error(`Cylinder with ID ${id} not found`);

  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);

  // prevent negative counts just in case
  const updatedCylinder = {
    ...c,
    full: Math.max(0, (c.full || 0) - quantity),
    empty: (c.empty || 0) + quantity,
  };

  await store.put(updatedCylinder);
  await tx.done;
  console.log("updatedCylinder :>> ", updatedCylinder);
  return updatedCylinder;
}

export async function getGasTypes() {
  const cylinders = await getCylinders();

  return cylinders.map((c) => ({
    id: c?.id ?? null,
    name: c?.name ?? "Unknown",
    capacity: c?.capacity + c?.capacityUnit,
  }));
}
