import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Info, HelpCircle, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Hotspot {
    id: number;
    x: string;
    y: string;
    label: string;
    desc?: string;
}

interface HotspotEditorProps {
    imageUrl: string;
    initialHotspots: Hotspot[];
    onSave: (hotspots: Hotspot[]) => void;
}

export default function HotspotEditor({ imageUrl, initialHotspots, onSave }: HotspotEditorProps) {
    const [hotspots, setHotspots] = useState<Hotspot[]>(initialHotspots || []);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-sync internal state to parent whenever hotspots change
    useEffect(() => {
        onSave(hotspots);
    }, [hotspots]);

    const handleImageClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newHotspot: Hotspot = {
            id: Date.now(),
            x: `${x.toFixed(2)}%`,
            y: `${y.toFixed(2)}%`,
            label: 'New Point',
            desc: ''
        };

        setHotspots([...hotspots, newHotspot]);
        setSelectedId(newHotspot.id);
        toast.info('Point added! Now give it a label.');
    };

    const updateHotspot = (id: number, field: keyof Hotspot, value: string) => {
        setHotspots(hotspots.map(h => h.id === id ? { ...h, [field]: value } : h));
    };

    const deleteHotspot = (id: number) => {
        setHotspots(hotspots.filter(h => h.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const selectedPoint = hotspots.find(h => h.id === selectedId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100 mb-2">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Interactive Hotspot Setter</h3>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Image Canvas */}
                <div className="lg:col-span-2 relative group">
                    <div
                        ref={containerRef}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-[#070707] cursor-crosshair shadow-lg ring-1 ring-slate-200/50"
                        style={{ maxHeight: '380px' }}
                        onClick={handleImageClick}
                    >
                        <img
                            src={imageUrl}
                            alt="Product"
                            className="w-full h-full object-contain mix-blend-lighten pointer-events-none p-4 mx-auto"
                        />

                        {/* Interactive Overlay Hint */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] text-white/70 font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to add point
                        </div>

                        {/* Render Hotspots */}
                        {hotspots.map((h) => (
                            <div
                                key={h.id}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20`}
                                style={{ left: h.x, top: h.y }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(h.id);
                                }}
                            >
                                <div className={`relative flex items-center justify-center`}>
                                    <div className={`absolute w-8 h-8 rounded-full animate-ping ${selectedId === h.id ? 'bg-blue-500/20' : 'bg-red-500/20'}`} />
                                    <div className={`w-4 h-3.5 rounded-full border-2 border-white shadow-xl transition-all duration-300 ${selectedId === h.id ? 'bg-blue-600 scale-125' : 'bg-red-600'}`} />

                                    {/* Label Preview */}
                                    <div className={`absolute bottom-full mb-2 whitespace-nowrap bg-black/80 text-white text-[9px] font-bold px-2 py-1 rounded pointer-events-none transition-opacity ${selectedId === h.id ? 'opacity-100' : 'opacity-0 group-hover/pin:opacity-100'}`}>
                                        {h.label}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!hotspots.length && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center space-y-2 opacity-30">
                                    <HelpCircle className="w-12 h-12 mx-auto text-white" />
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Click to start placing pins</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedPoint ? (
                            <motion.div
                                key={selectedPoint.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 pt-2"
                            >
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-blue-600/10 text-blue-600 border border-blue-200 shadow-none">POINT {hotspots.findIndex(h => h.id === selectedPoint.id) + 1}</Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="h-7 w-7 text-red-500 hover:bg-red-50"
                                        onClick={() => {
                                            deleteHotspot(selectedPoint.id);
                                            toast.success('Point removed');
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                <div className="grid gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Pill Label</Label>
                                        <Input
                                            value={selectedPoint.label}
                                            onChange={(e) => updateHotspot(selectedPoint.id, 'label', e.target.value)}
                                            className="bg-white h-8 text-xs font-bold"
                                            placeholder="e.g. LED Light"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Position</Label>
                                        <div className="h-8 flex items-center px-3 bg-slate-100 rounded-md text-[9px] font-mono text-slate-500">
                                            {selectedPoint.x}, {selectedPoint.y}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400">Description</Label>
                                    <Textarea
                                        value={selectedPoint.desc || ''}
                                        onChange={(e) => updateHotspot(selectedPoint.id, 'desc', e.target.value)}
                                        className="bg-white resize-none text-xs"
                                        rows={2}
                                        placeholder="Details..."
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full h-7 text-[10px] font-bold border-dashed hover:bg-slate-50"
                                    onClick={() => setSelectedId(null)}
                                >
                                    Deselect
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border">
                                    <MousePointerClick className="w-4 h-4 text-slate-300" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug">Click image to add point, or select a pin to edit</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Quick List (Tiny) */}
                    {hotspots.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-6 pt-4 border-t border-slate-100">
                            {hotspots.map((h, i) => (
                                <button
                                    key={h.id}
                                    type="button"
                                    onClick={() => setSelectedId(h.id)}
                                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all ${selectedId === h.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    P{i + 1}: {h.label.slice(0, 10)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reuse icon
/* MousePointerClick is now imported from lucide-react */

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${className}`}>
        {children}
    </span>
);
