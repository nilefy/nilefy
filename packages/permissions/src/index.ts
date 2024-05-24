import z from "zod";

export const permissionsTypes = z.enum([
  // APPS
  /**
   * create new app in the workspace
   */
  "Apps-Write",
  /**
   * delete app user has access to
   */
  "Apps-Delete",
  // DATASOURCES
  /**
   * create new datasource in the workspace
   */
  "Datasources-Write",
  /**
   * delete datasource user has access to
   */
  "Datasources-Delete",
]);
