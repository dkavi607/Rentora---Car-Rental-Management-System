import React, { useState } from 'react';
import { DamagePoint } from '../../types';
import { AlertTriangle, Plus, Trash2, ShieldAlert, CheckCircle2, Camera } from 'lucide-react';

interface DamageInspectorProps {
  damages: DamagePoint[];
  onChange: (damages: DamagePoint[]) => void;
  readOnly?: boolean;
  title?: string;
  isReturnInspection?: boolean;
}

export const DamageInspector: React.FC<DamageInspectorProps> = ({
  damages,
  onChange,
  readOnly = false,
  title = 'Interactive Vehicle Inspection & Damage Hotspots',
  isReturnInspection = false
}) => {
  const [activeView, setActiveView] = useState<'top' | 'front' | 'rear' | 'left' | 'right'>('top');
  const [selectedPoint, setSelectedPoint] = useState<DamagePoint | null>(null);

  // New damage entry form state
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [newType, setNewType] = useState<DamagePoint['type']>('scratch');
  const [newSeverity, setNewSeverity] = useState<DamagePoint['severity']>('minor');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState(30);

  const handleDiagramClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setPendingCoords({ x, y });
    setSelectedPoint(null);
  };

  const handleAddDamagePoint = () => {
    if (!pendingCoords || !newDescription.trim()) return;

    const newPoint: DamagePoint = {
      id: `dmg-${Date.now()}`,
      view: activeView,
      x: pendingCoords.x,
      y: pendingCoords.y,
      type: newType,
      severity: newSeverity,
      description: newDescription.trim(),
      estimatedCost: Number(newCost) || 0,
      status: isReturnInspection ? 'New' : 'Existing'
    };

    onChange([...damages, newPoint]);
    setPendingCoords(null);
    setNewDescription('');
    setNewCost(30);
  };

  const handleRemovePoint = (id: string) => {
    onChange(damages.filter(d => d.id !== id));
    if (selectedPoint?.id === id) setSelectedPoint(null);
  };

  const currentViewDamages = damages.filter(d => d.view === activeView);

  const getSeverityBadge = (sev: DamagePoint['severity']) => {
    switch (sev) {
      case 'severe': return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getTypeColor = (type: DamagePoint['type']) => {
    switch (type) {
      case 'dent': return '#DC2626'; // Red
      case 'scratch': return '#F59E0B'; // Amber
      case 'crack': return '#9333EA'; // Purple
      case 'chip': return '#2563EB'; // Blue
      default: return '#E11D48';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            {title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {readOnly 
              ? 'Showing marked inspection points and physical condition.' 
              : 'Click on any part of the vehicle diagram to record a scratch, dent, or mark.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          {(['top', 'front', 'rear', 'left', 'right'] as const).map(view => (
            <button
              key={view}
              type="button"
              onClick={() => {
                setActiveView(view);
                setPendingCoords(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize ${
                activeView === view
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {view} View
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Diagram Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 relative">
          <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Vehicle {activeView} Perspective Diagram
          </div>

          <div className="relative w-full max-w-[380px] aspect-[4/3] bg-white rounded-lg border border-slate-200 flex items-center justify-center p-3 shadow-inner select-none">
            <svg
              viewBox="0 0 400 300"
              className={`w-full h-full ${!readOnly ? 'cursor-crosshair' : ''}`}
              onClick={handleDiagramClick}
            >
              {/* Background Grid Accent */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#grid)" />

              {/* Render Vector Outline based on activeView */}
              {activeView === 'top' && (
                <g stroke="#334155" strokeWidth="2.5" fill="#F8FAFC">
                  {/* Car Body Outer Shell */}
                  <path d="M 120 50 C 130 30, 270 30, 280 50 C 295 80, 295 220, 280 250 C 270 270, 130 270, 120 250 C 105 220, 105 80, 120 50 Z" />
                  {/* Windshield & Rear Glass */}
                  <path d="M 135 90 C 160 80, 240 80, 265 90 L 255 125 C 235 120, 165 120, 145 125 Z" fill="#E2E8F0" />
                  <path d="M 140 210 C 165 215, 235 215, 260 210 L 255 180 C 235 185, 165 185, 145 180 Z" fill="#E2E8F0" />
                  {/* Roof */}
                  <rect x="145" y="125" width="110" height="55" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
                  {/* Side Windows */}
                  <path d="M 130 100 L 140 105 L 140 195 L 130 200 Z" fill="#E2E8F0" />
                  <path d="M 270 100 L 260 105 L 260 195 L 270 200 Z" fill="#E2E8F0" />
                  {/* Hood lines */}
                  <path d="M 145 50 L 155 85" stroke="#94A3B8" strokeWidth="1.5" />
                  <path d="M 255 50 L 245 85" stroke="#94A3B8" strokeWidth="1.5" />
                  {/* Front/Rear Bumpers & Headlights */}
                  <ellipse cx="140" cy="52" rx="12" ry="5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                  <ellipse cx="260" cy="52" rx="12" ry="5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                  <ellipse cx="138" cy="248" rx="12" ry="5" fill="#FECACA" stroke="#DC2626" strokeWidth="1" />
                  <ellipse cx="262" cy="248" rx="12" ry="5" fill="#FECACA" stroke="#DC2626" strokeWidth="1" />
                  {/* Side Mirrors */}
                  <rect x="92" y="95" width="14" height="24" rx="4" fill="#64748B" stroke="#334155" />
                  <rect x="294" y="95" width="14" height="24" rx="4" fill="#64748B" stroke="#334155" />
                  {/* Orientation marker */}
                  <text x="200" y="32" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold">▲ FRONT HOOD</text>
                  <text x="200" y="285" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold">▼ REAR TRUNK</text>
                </g>
              )}

              {activeView === 'front' && (
                <g stroke="#334155" strokeWidth="2.5" fill="#F8FAFC">
                  {/* Front Bumper & Grill */}
                  <path d="M 90 220 L 310 220 L 300 170 C 290 120, 270 100, 250 90 L 150 90 C 130 100, 110 120, 100 170 Z" />
                  {/* Windshield */}
                  <path d="M 140 95 L 260 95 L 280 150 L 120 150 Z" fill="#E2E8F0" />
                  {/* Front Grill */}
                  <rect x="160" y="175" width="80" height="35" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="2" />
                  {/* Headlights */}
                  <polygon points="105,160 145,155 140,175 110,175" fill="#FEF08A" stroke="#EAB308" strokeWidth="1.5" />
                  <polygon points="295,160 255,155 260,175 290,175" fill="#FEF08A" stroke="#EAB308" strokeWidth="1.5" />
                  {/* Fog lamps & Plate */}
                  <circle cx="120" cy="205" r="7" fill="#FEF08A" />
                  <circle cx="280" cy="205" r="7" fill="#FEF08A" />
                  <rect x="175" y="215" width="50" height="15" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
                  {/* Wheels */}
                  <rect x="75" y="195" width="20" height="35" rx="4" fill="#0F172A" />
                  <rect x="305" y="195" width="20" height="35" rx="4" fill="#0F172A" />
                  {/* Mirrors */}
                  <ellipse cx="80" cy="135" rx="14" ry="8" fill="#64748B" />
                  <ellipse cx="320" cy="135" rx="14" ry="8" fill="#64748B" />
                </g>
              )}

              {activeView === 'rear' && (
                <g stroke="#334155" strokeWidth="2.5" fill="#F8FAFC">
                  {/* Rear Body */}
                  <path d="M 90 220 L 310 220 L 300 170 C 290 120, 270 100, 250 90 L 150 90 C 130 100, 110 120, 100 170 Z" />
                  {/* Rear Glass */}
                  <path d="M 140 95 L 260 95 L 275 145 L 125 145 Z" fill="#E2E8F0" />
                  {/* Tail Lights */}
                  <polygon points="105,155 145,155 140,175 110,175" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
                  <polygon points="295,155 255,155 260,175 290,175" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
                  {/* Trunk lid line & License plate */}
                  <path d="M 135 180 L 265 180" stroke="#94A3B8" strokeWidth="1.5" />
                  <rect x="175" y="188" width="50" height="18" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
                  {/* Exhaust Pipe & Wheels */}
                  <circle cx="115" cy="225" r="5" fill="#475569" />
                  <rect x="75" y="195" width="20" height="35" rx="4" fill="#0F172A" />
                  <rect x="305" y="195" width="20" height="35" rx="4" fill="#0F172A" />
                </g>
              )}

              {activeView === 'left' && (
                <g stroke="#334155" strokeWidth="2.5" fill="#F8FAFC">
                  {/* Left Side Profile */}
                  <path d="M 50 195 L 350 195 C 345 155, 310 150, 270 140 L 220 100 L 140 100 L 90 140 C 70 145, 55 165, 50 195 Z" />
                  {/* Windows */}
                  <path d="M 145 108 L 215 108 L 255 140 L 105 140 Z" fill="#E2E8F0" />
                  {/* Door Dividers */}
                  <line x1="180" y1="108" x2="180" y2="195" stroke="#94A3B8" strokeWidth="2" />
                  {/* Handles */}
                  <rect x="155" y="148" width="14" height="4" rx="1" fill="#334155" />
                  <rect x="225" y="148" width="14" height="4" rx="1" fill="#334155" />
                  {/* Wheel Arches & Wheels */}
                  <circle cx="105" cy="195" r="24" fill="#0F172A" />
                  <circle cx="105" cy="195" r="14" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  <circle cx="295" cy="195" r="24" fill="#0F172A" />
                  <circle cx="295" cy="195" r="14" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  <text x="60" y="80" fill="#64748B" fontSize="10" fontWeight="bold">◀ FRONT</text>
                  <text x="310" y="80" fill="#64748B" fontSize="10" fontWeight="bold">REAR ▶</text>
                </g>
              )}

              {activeView === 'right' && (
                <g stroke="#334155" strokeWidth="2.5" fill="#F8FAFC">
                  {/* Right Side Profile (Mirrored) */}
                  <path d="M 350 195 L 50 195 C 55 155, 90 150, 130 140 L 180 100 L 260 100 L 310 140 C 330 145, 345 165, 350 195 Z" />
                  {/* Windows */}
                  <path d="M 255 108 L 185 108 L 145 140 L 295 140 Z" fill="#E2E8F0" />
                  {/* Door Divider */}
                  <line x1="220" y1="108" x2="220" y2="195" stroke="#94A3B8" strokeWidth="2" />
                  {/* Handles */}
                  <rect x="235" y="148" width="14" height="4" rx="1" fill="#334155" />
                  <rect x="165" y="148" width="14" height="4" rx="1" fill="#334155" />
                  {/* Wheels */}
                  <circle cx="295" cy="195" r="24" fill="#0F172A" />
                  <circle cx="295" cy="195" r="14" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  <circle cx="105" cy="195" r="24" fill="#0F172A" />
                  <circle cx="105" cy="195" r="14" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  <text x="310" y="80" fill="#64748B" fontSize="10" fontWeight="bold">FRONT ▶</text>
                  <text x="60" y="80" fill="#64748B" fontSize="10" fontWeight="bold">◀ REAR</text>
                </g>
              )}

              {/* Render Existing & New Damage Hotspot Pins */}
              {currentViewDamages.map((dmg, index) => {
                const isSel = selectedPoint?.id === dmg.id;
                const pinColor = dmg.status === 'New' ? '#DC2626' : getTypeColor(dmg.type);

                return (
                  <g
                    key={dmg.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoint(dmg);
                      setPendingCoords(null);
                    }}
                  >
                    <circle
                      cx={`${dmg.x}%`}
                      cy={`${dmg.y}%`}
                      r={isSel ? "11" : "8"}
                      fill={pinColor}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="drop-shadow-md animate-pulse"
                    />
                    <text
                      x={`${dmg.x}%`}
                      y={`${dmg.y}%`}
                      dy="3.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}

              {/* Render Pending Coordinate Placement Marker */}
              {pendingCoords && (
                <g>
                  <circle
                    cx={`${pendingCoords.x}%`}
                    cy={`${pendingCoords.y}%`}
                    r="10"
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                  <circle
                    cx={`${pendingCoords.x}%`}
                    cy={`${pendingCoords.y}%`}
                    r="6"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Scratch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Dent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Crack
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Chip
            </span>
          </div>
        </div>

        {/* Action Panel & Hotspot Details */}
        <div className="lg:col-span-5 space-y-4">
          {/* If a new pin was clicked on diagram */}
          {pendingCoords && !readOnly && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Add Hotspot ({activeView.toUpperCase()})
                </span>
                <button
                  type="button"
                  onClick={() => setPendingCoords(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Damage Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="scratch">Scratch / Scuff</option>
                      <option value="dent">Dent / Ding</option>
                      <option value="crack">Crack / Fracture</option>
                      <option value="chip">Glass / Paint Chip</option>
                      <option value="stain">Interior Stain</option>
                      <option value="other">Other Damage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                    <select
                      value={newSeverity}
                      onChange={e => setNewSeverity(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="minor">Minor (&lt; 5cm)</option>
                      <option value="moderate">Moderate (5 - 15cm)</option>
                      <option value="severe">Severe (&gt; 15cm / Deep)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Location</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="e.g. 4cm door ding near door handle"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Repair Cost ($)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={e => setNewCost(Number(e.target.value))}
                    min="0"
                    step="5"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddDamagePoint}
                  disabled={!newDescription.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  Confirm Hotspot Record
                </button>
              </div>
            </div>
          )}

          {/* Selected Point Details */}
          {selectedPoint && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Hotspot #{damages.findIndex(d => d.id === selectedPoint.id) + 1} Details
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(selectedPoint.id)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>

              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Perspective:</span>
                  <span className="font-semibold capitalize text-slate-800">{selectedPoint.view} View</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type & Severity:</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold capitalize ${getSeverityBadge(selectedPoint.severity)}`}>
                    {selectedPoint.severity} {selectedPoint.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Description:</span>
                  <span className="font-medium text-slate-800 max-w-[200px] text-right">{selectedPoint.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Repair Cost:</span>
                  <span className="font-bold text-slate-900">${selectedPoint.estimatedCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-blue-600">{selectedPoint.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* List of Marked Damages on the vehicle */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Recorded Points ({damages.length})
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Total Est: ${damages.reduce((sum, d) => sum + (d.estimatedCost || 0), 0)}
              </span>
            </div>

            {damages.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                No physical damages recorded. Vehicle in clean condition.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {damages.map((dmg, idx) => (
                  <div
                    key={dmg.id}
                    onClick={() => {
                      setActiveView(dmg.view);
                      setSelectedPoint(dmg);
                      setPendingCoords(null);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedPoint?.id === dmg.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800 capitalize">
                          {dmg.view} • {dmg.type}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {dmg.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">${dmg.estimatedCost}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePoint(dmg.id);
                          }}
                          className="text-slate-300 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
