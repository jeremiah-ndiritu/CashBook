import { initDB, STORE_CYLINDERS } from "../db.js";

export function normalizeGasCylinder(c) {
  return {
    id: c?.id || 1,
    name: String(c?.name) || "N/A",
    capacity: String(c?.capacity) || "6",
    capacityUnit: c?.capacityUnit || "kg",
    cylinderBuyingPrice: parseFloat(c?.cylinderBuyingPrice),
    gasBuyingPrice: parseFloat(c?.gasBuyingPrice),
    buyingPrice:
      parseFloat(c?.gasBuyingPrice || 0) +
      parseFloat(c?.cylinderBuyingPrice || 0),
    sellingPrice: parseFloat(c?.sellingPrice) || 3000.0,
    refillPrice: parseFloat(c?.refillPrice) || 1050.0,
    quantity: parseInt(c?.quantity) || 1,
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

export async function updateCylinderQuantity(name, delta) {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);
  const all = await store.getAll();
  const cylinder = all.find((c) => c.name === name);
  if (!cylinder) throw new Error("Cylinder not found");
  cylinder.quantity = Math.max(0, cylinder.quantity + delta);
  await store.put(cylinder);
  await tx.done;
  return normalizeGasCylinder(cylinder);
}

export async function deleteCylinder(name) {
  const db = await initDB();
  const tx = db.transaction(STORE_CYLINDERS, "readwrite");
  const store = tx.objectStore(STORE_CYLINDERS);
  const all = await store.getAll();
  const target = all.find((c) => c.name === name);
  if (target) await store.delete(target.id);
  await tx.done;
  return true;
}
