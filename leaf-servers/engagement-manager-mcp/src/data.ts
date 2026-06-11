export interface Engagement {
  id: string;
  name: string;
  clientName: string;
  status: "Active" | "Planning" | "Completed";
  engagementManager: string;
  region: string;
  staffedEmployees: string[];
}

export const engagements: Engagement[] = [
  { id: "ENG001", name: "SOX Controls FY26", clientName: "Northwind Retail", status: "Active", engagementManager: "Maya Collins", region: "US", staffedEmployees: ["Aarav Sharma", "Priya Nair"] },
  { id: "ENG002", name: "Cloud Security Review", clientName: "Fabrikam Energy", status: "Planning", engagementManager: "Daniel Ortiz", region: "LATAM", staffedEmployees: ["Sofia Martinez", "Diego Ramirez"] },
  { id: "ENG003", name: "ITGC Audit", clientName: "Contoso Manufacturing", status: "Active", engagementManager: "Lucia Moreno", region: "LATAM", staffedEmployees: ["Valeria Gomez", "Mateo Herrera"] }
];
