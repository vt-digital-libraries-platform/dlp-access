declare module "mirador" {
  export interface MiradorConfig {
    language?: string;
    id?: string;
    window?: Record<string, unknown>;
    views?: Array<Record<string, unknown>>;
    windows?: Array<Record<string, unknown>>;
    thumbnailNavigation?: Record<string, unknown>;
    workspace?: Record<string, unknown>;
    workspaceControlPanel?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface MiradorModule {
    viewer(config: MiradorConfig): unknown;
  }

  const Mirador: MiradorModule;
  export default Mirador;
}
