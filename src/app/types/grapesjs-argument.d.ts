import "grapesjs";

declare module "grapesjs" {
  namespace DomComponents {
    interface AddOptions {
      skipSync?: boolean;
    }
    interface UpdateOptions {
      skipSync?: boolean;
    }
    interface RemoveOptions {
      skipSync?: boolean;
    }

    interface Component extends Record<string, unknown> {}
  }
  interface Editor {
    getComponentById(id: string): import("grapesjs").DomComponents.Componet | undefined;
  }
}
