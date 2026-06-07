import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Settings } from 'lucide-react';
import $ from 'jquery';
// @ts-ignore
window.$ = window.jQuery = $;
import * as $3Dmol from '3dmol';

interface ProteinViewerProps {
  pdb: string;
  height?: number;
  style?: 'cartoon' | 'stick' | 'surface' | 'sphere';
  coloring?: 'spectrum' | 'chain' | 'residue' | 'blue';
}

export const ProteinViewer: React.FC<ProteinViewerProps> = ({
  pdb,
  height = 400,
  style: initStyle = 'cartoon',
  coloring: initColoring = 'spectrum',
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);
  const [viewStyle, setViewStyle] = useState(initStyle);
  const [spinning, setSpinning] = useState(true);

  const applyStyle = (viewer: $3Dmol.GLViewer, s: string) => {
    viewer.setStyle({}, {});
    switch (s) {
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { color: initColoring === 'blue' ? '#3b82f6' : 'spectrum', thickness: 0.6 } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { colorscheme: 'Jmol' } });
        break;
      case 'surface':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.7, color: 'spectrum' });
        break;
      case 'sphere':
        viewer.setStyle({}, { sphere: { colorscheme: 'Jmol', scale: 0.3 } });
        break;
    }
    viewer.render();
  };

  useEffect(() => {
    if (!viewerRef.current || !pdb) return;

    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: '#000008',
      antialias: true,
      id: `viewer-${Date.now()}`,
    });

    try {
      viewer.addModel(pdb, 'pdb');
      applyStyle(viewer, viewStyle);
      viewer.zoomTo();
      viewer.render();
      viewer.spin(spinning);
      viewerInstance.current = viewer;
    } catch (e) {
      console.error('3DMol error:', e);
    }

    return () => {
      try { viewer.clear(); } catch {}
    };
  }, [pdb]);

  const changeStyle = (s: typeof viewStyle) => {
    setViewStyle(s);
    if (viewerInstance.current) applyStyle(viewerInstance.current, s);
  };

  const toggleSpin = () => {
    setSpinning(sp => {
      const next = !sp;
      if (viewerInstance.current) viewerInstance.current.spin(next);
      return next;
    });
  };

  return (
    <div className="protein-viewer-container relative" style={{ height }}>
      <div ref={viewerRef} className="w-full h-full" />

      {/* Controls overlay */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={toggleSpin}
          className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title={spinning ? 'Stop rotation' : 'Start rotation'}
        >
          <RotateCw size={14} className={spinning ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={() => viewerInstance.current?.zoom(1.3, 400)}
          className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => viewerInstance.current?.zoom(0.77, 400)}
          className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => viewerInstance.current?.zoomTo()}
          className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Reset view"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Style controls */}
      <div className="absolute bottom-3 left-3 flex gap-1.5">
        {(['cartoon', 'stick', 'sphere'] as const).map(s => (
          <button
            key={s}
            onClick={() => changeStyle(s)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border capitalize transition-all ${
              viewStyle === s
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-black/60 text-white/60 border-white/10 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 right-3 text-[10px] text-white/30">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
};
