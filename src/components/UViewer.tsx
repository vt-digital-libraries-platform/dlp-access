import { useEffect, useRef } from "react";

interface Props {
  manifestUrl: string;
  maxPxHeight?: number;
  config?: Record<string, unknown>;
  className?: string;
}

const UViewer = ({ manifestUrl, maxPxHeight, config, className }: Props) => {
  const uvContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!uvContainerRef.current) return;
    if (!(window as any).UV) {
      console.error("window UV does not exist");
      return;
    }
    const data = {
      manifest: manifestUrl,
      embedded: true,
      ...(config ? { config } : {})
    };
    const uv = (window as any).UV.init(uvContainerRef.current, data);
    uv.on("configure", ({ cb }: any) =>
      cb({ options: { rightPanelEnabled: false } })
    );
    return () => {
      try {
        uv?.dispose?.();
      } catch {
        // dispose failed. uv already torn down
      }
    };
  }, [manifestUrl, config]);
  return (
    <div
      className={`uv ${className}`}
      ref={uvContainerRef}
      style={{
        width: "100%",
        height: maxPxHeight ? `${maxPxHeight}px` : "87vh"
      }}
    />
  );
};

export default UViewer;
