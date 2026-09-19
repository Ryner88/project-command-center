export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type WorkPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Task = { id:string; projectId:string; title:string; description?:string; priority:WorkPriority; position:number; completedAt?:string; createdAt:string; updatedAt:string };
export type Project = { id:string; name:string; clientName:string; description:string; status:ProjectStatus; priority:WorkPriority; startDate?:string; dueDate?:string; archivedAt?:string; createdAt:string; updatedAt:string; tasks:Task[]; proposalCount:number };
