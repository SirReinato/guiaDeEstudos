declare module "sql.js" {
  export class Database {
    constructor(data?: Uint8Array | null);
    exec(sql: string | { sql: string; params?: unknown[] }): Array<{ columns: string[]; values: unknown[][] }>;
    run(sql: string, params?: unknown[]): void;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    (options?: { locateFile?: (file: string) => string }): Promise<{ Database: typeof Database }>;
  }

  const SqlJs: SqlJsStatic;
  export default SqlJs;
}
