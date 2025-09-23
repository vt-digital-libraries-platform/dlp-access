import { useEffect, useRef } from "react";
import "../../public/css/uv/uv.css";

interface Props {
  manifestUrl: string;
  maxPxHeight?: number;
  config?: Record<string, unknown>;
  className?: string;
}

const UViewer = ({ manifestUrl, maxPxHeight, config, className }: Props) => {
  const uvContainerRef = useRef<HTMLDivElement | null>(null);
  const uvInstanceRef = useRef(null);

  useEffect(() => {
    const initViewer = async () => {
      const { init } = await import("universalviewer");
      if (!uvContainerRef.current) return;
      const data = {
        manifest: manifestUrl,
        ...(config ? { config } : {})
      };
      uvInstanceRef.current = init(uvContainerRef.current, data);
    };
    initViewer();
  }, [manifestUrl, config]);
  return (
    <div
      className={className}
      ref={uvContainerRef}
      style={{
        width: "100%",
        height: maxPxHeight ? `${maxPxHeight}px` : "100vh"
      }}
    />
  );
};

export default UViewer;
