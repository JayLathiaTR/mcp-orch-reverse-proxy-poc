export interface ControlTest {
  id: string;
  controlArea: string;
  testStatus: "Not Started" | "In Progress" | "Passed" | "Failed";
  owner: string;
}

export const controlTests: ControlTest[] = [
  { id: "CTL001", controlArea: "User Access Reviews", testStatus: "In Progress", owner: "Alicia Park" },
  { id: "CTL002", controlArea: "Change Management", testStatus: "Passed", owner: "Rafael Soto" },
  { id: "CTL003", controlArea: "Backup and Recovery", testStatus: "Not Started", owner: "Alicia Park" }
];
