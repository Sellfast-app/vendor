export interface InventoryCategory { id: string; name: string; description: string; allBranches: boolean }
export interface InventoryUnit extends InventoryCategory { abbreviation: string; platform?: boolean }
export interface InventoryItem {
  id: string; name: string; description: string; quantity: number; unitId: string;
  price: number; secondPrice: number | null; categoryId: string; images: string[];
  lowStock: boolean; threshold: number;
}
export interface FoodInventory { items: InventoryItem[]; categories: InventoryCategory[]; units: InventoryUnit[] }
export const PLATFORM_UNITS: InventoryUnit[] = [
  ["pack", "Pack", "pk"], ["pieces", "Pieces", "pcs"], ["kg", "Kg", "kg"],
  ["gram", "Gram", "g"], ["litre", "Litre", "L"], ["gallon", "Gallon", "gal"],
].map(([id, name, abbreviation]) => ({ id: "platform-" + id, name, abbreviation, description: "", allBranches: true, platform: true }));
export const emptyInventory = (): FoodInventory => ({ items: [], categories: [], units: [] });
export const normalizedName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();
export function uniqueName(name: string, entries: { id: string; name: string }[], id?: string) {
  return !!name.trim() && !entries.some(entry => entry.id !== id && normalizedName(entry.name) === normalizedName(name));
}
export function inventoryStatus(item: InventoryItem) {
  return item.quantity === 0 ? "Out of stock" : item.lowStock && item.quantity <= item.threshold ? "Low stock" : "In stock";
}
export function validateItem(item: InventoryItem, inventory: FoodInventory) {
  if (!item.name.trim() || item.name.length > 120) throw new Error("Enter an item name (up to 120 characters).");
  if (item.description.length > 200) throw new Error("Description must not exceed 200 characters.");
  if (![item.quantity, item.price, item.threshold].every(value => Number.isFinite(value) && value >= 0)) throw new Error("Quantity, price and stock level must be zero or greater.");
  if (!Number.isFinite(item.quantity * item.price)) throw new Error("Total price is too large.");
  if (item.secondPrice !== null && (!Number.isFinite(item.secondPrice) || item.secondPrice < 0)) throw new Error("Enter a valid second price.");
  if (![...PLATFORM_UNITS, ...inventory.units].some(unit => unit.id === item.unitId)) throw new Error("Select a unit.");
  if (item.categoryId && !inventory.categories.some(category => category.id === item.categoryId)) throw new Error("Select an existing category.");
  if (item.images.length > 5) throw new Error("A maximum of five images is allowed.");
}
export function parseInventory(raw: string): FoodInventory {
  const value = JSON.parse(raw) as FoodInventory;
  if (!value || !Array.isArray(value.items) || !Array.isArray(value.categories) || !Array.isArray(value.units)) throw new Error("Invalid inventory.");
  const ids = new Set<string>();
  for (const entry of [...value.items, ...value.categories, ...value.units]) {
    if (!entry || typeof entry.id !== "string" || !entry.id || ids.has(entry.id) ||
      typeof entry.name !== "string" || !entry.name.trim() || typeof entry.description !== "string") throw new Error("Invalid inventory record.");
    ids.add(entry.id);
  }
  for (const entry of [...value.categories, ...value.units]) {
    if (typeof entry.allBranches !== "boolean") throw new Error("Invalid branch scope.");
  }
  for (const unit of value.units) {
    if (unit.platform || PLATFORM_UNITS.some(platform => platform.id === unit.id) || typeof unit.abbreviation !== "string" || unit.abbreviation.length > 10) throw new Error("Invalid custom unit.");
  }
  for (const item of value.items) {
    if (!Array.isArray(item.images) || item.images.some(src => typeof src !== "string" || !/^data:image\/(png|jpeg|gif|webp);base64,/.test(src)) || typeof item.lowStock !== "boolean") throw new Error("Invalid item data.");
    validateItem(item, value);
  }
  return value;
}
export function inventoryKey() {
  return "swiftree:food-inventory-preview:" + (localStorage.getItem("store_id") || "demo");
}
