import { useEffect, useRef } from "react";
import "universalviewer/dist/esm/index.css";

interface Props {
  manifestUrl: string;
  maxPxHeight?: number;
  config?: Record<string, unknown>;
  className?: string;
}

const UViewer = ({ manifestUrl, maxPxHeight, config, className }: Props) => {
  const uvContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initViewer = async () => {
      const { init } = await import("universalviewer");
      if (!uvContainerRef.current) return;
      const data = {
        manifest: manifestUrl,
        embedded: true,
        ...(config ? { config } : {})
      };
      const uv = init(uvContainerRef.current, data);
      // uv.on("configure", ({ cb }: any) =>
      //   cb({ options: { rightPanelEnabled: false } })
      // );
    };
    initViewer();
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
