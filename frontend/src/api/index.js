import client from "./client";

// Materials
export const getMaterials = () => client.get("/materials/");
export const createMaterial = (data) => client.post("/materials/", data);
export const getMaterialInventory = (id) =>
  client.get(`/materials/${id}/inventory`);
export const getAllMaterialsInventory = () =>
  client.get("/materials/inventory");
export const deleteMaterial = (id) => client.delete(`/materials/${id}`);

// Companies
export const getCompanies = () => client.get("/companies/");
export const createCompany = (data) => client.post("/companies/", data);
export const deleteCompany = (id) => client.delete(`/companies/${id}`);

// Transactions
export const getTransactions = () => client.get("/transactions/");
export const getDueSoon = () => client.get("/transactions/due-soon");
export const createTransaction = (data) => client.post("/transactions/", data);
export const updateTransaction = (id, data) =>
  client.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => client.delete(`/transactions/${id}`);
export const markReturned = (id) => client.patch(`/transactions/${id}/return`);

// Settlements
export const getSettlements = () => client.get("/settlements/");
export const createSettlement = (data) => client.post("/settlements/", data);
export const markSettlementComplete = (id) =>
  client.patch(`/settlements/${id}/complete`);

// Damage history
export const getDamageList = (resolved) =>
  client.get("/damage-history/", {
    params: resolved !== undefined ? { resolved } : {},
  });
export const createDamage = (data) => client.post("/damage-history/", data);
export const resolveDamage = (id) =>
  client.patch(`/damage-history/${id}/resolve`);

export const unmarkReturned = (id) =>
  client.patch(`/transactions/${id}/unreturn`);

export const unmarkSettlementComplete = (id) =>
  client.patch(`/settlements/${id}/uncomplete`);

export const unresolveDamage = (id) =>
  client.patch(`/damage-history/${id}/unresolve`);
