import z from "zod";

const permissionsTypes = z.enum([
  "Workspaces-Read",
  "Workspaces-Write",
  "Workspaces-Delete",
  // APPS
  "Apps-Read",
  "Apps-Write",
  "Apps-Delete",
]);

export { permissionsTypes };
