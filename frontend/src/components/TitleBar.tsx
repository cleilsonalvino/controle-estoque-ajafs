import React from "react";
import { X, Minus, Maximize2, Minimize2, Option } from "lucide-react";

export function TitleBar() {
  const handleClose = () => window.api.close();
  const handleMinimize = () => window.api.minimize();
  const handleMaximize = () => window.api.maximize();
  const handleDevOps = () => window.api.devOps();


  return (
    <div
      style={{
        height: "30px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        background: "#3654D9",
        color: "white",
        padding: "0 10px",
        WebkitAppRegion: "drag", // permite arrastar a janela
      } as React.CSSProperties}>
        <button className="m-2 hover:bg-white hover:text-black transition-colors duration-300" onClick={handleDevOps} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <Option size={16} />
      </button>
      <button className="m-2 hover:bg-white hover:text-black transition-colors duration-300" onClick={handleMinimize} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <Minus size={16} />
      </button>
      <button className="m-2 hover:bg-white hover:text-black transition-colors duration-300" onClick={handleMaximize} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <Maximize2 size={16} />
      </button>
      <button className="m-2 hover:bg-white hover:text-black transition-colors duration-300" onClick={handleClose} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <X size={16} />
      </button>
    </div>
  );
}
