declare module "disable-devtool" {
  type Config = {
    md5?: string;
    url?: string;
    tkName?: string;
    ondevtoolopen?: (type: number, next: () => void) => void;
    ondevtoolclose?: (() => void) | null;
    interval?: number;
    disableMenu?: boolean;
    stopIntervalTime?: number;
    clearIntervalWhenDevOpenTrigger?: boolean;
    detectors?: number[] | "all";
    clearLog?: boolean;
    disableSelect?: boolean;
    disableCopy?: boolean;
    disableCut?: boolean;
    disablePaste?: boolean;
    ignore?: ((() => boolean) | string | RegExp)[] | null;
    disableIframeParents?: boolean;
    seo?: boolean;
  };
  type Result = { success: boolean; reason: string };
  function DisableDevtool(config?: Config): Result;
  namespace DisableDevtool {
    let isRunning: boolean;
    let isSuspend: boolean;
  }
  export default DisableDevtool;
}
