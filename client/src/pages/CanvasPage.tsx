import React, { useState } from 'react';

export function CanvasPage() {
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const addOptions = [
    { id: 'line', name: 'NEW LINE ITEM', icon: '➕' },
    { id: 'block', name: 'TEMPLATE BLOCK', icon: '📋' },
    { id: 'clause', name: 'CONTRACT CLAUSE', icon: '📝' },
  ];

  return (
    <div className="screen-canvas">
      {/* Toolbar */}
      <div className="border-b-2 border-grit-300 p-2 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary py-2 px-4 text-sm"
            >
              ← BACK
            </button>
            <span className="body-base text-grit-600 self-center">
              INVOICE #INV-001
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleZoomOut}
              className="btn-secondary py-2 px-4 text-sm"
            >
              ➖
            </button>
            <span className="body-base text-grit-600 self-center min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="btn-secondary py-2 px-4 text-sm"
            >
              ➕
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="btn-action py-2 px-4 text-sm"
            >
              + ADD
            </button>
            <button className="btn-primary py-2 px-4 text-sm">
              → SEND
            </button>
          </div>
        </div>
      </div>

      {/* Add Menu */}
      {showAddMenu && (
        <div className="absolute top-16 right-4 z-10 bg-white border-2 border-grit-300 p-4 space-y-2">
          {addOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                console.log('Adding:', option.id);
                setShowAddMenu(false);
              }}
              className="card-interactive w-full text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span className="body-base font-bold">{option.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Document Canvas */}
      <div className="flex-1 overflow-auto bg-grit-100 p-4">
        <div 
          className="mx-auto bg-white shadow-grit-lg"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: '210mm', // A4 width
            minHeight: '297mm', // A4 height
            padding: '20mm'
          }}
        >
          {/* Document Header */}
          <div className="border-b-2 border-grit-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-grit-900 uppercase mb-2">INVOICE</h1>
                <p className="text-lg text-grit-600">#INV-001</p>
              </div>
              <div className="w-24 h-24 border-2 border-grit-300 flex items-center justify-center">
                <span className="text-grit-500 text-xs">LOGO</span>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-grit-900 uppercase mb-3">FROM:</h3>
              <div 
                className={`space-y-1 ${isEditing ? 'bg-orange-50 p-2 border-2 border-orange-300' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <p className="font-bold">SMITH PLUMBING</p>
                <p>123 MAIN STREET</p>
                <p>ANYTOWN, ST 12345</p>
                <p>john@smithplumbing.com</p>
                <p>(555) 123-4567</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-grit-900 uppercase mb-3">TO:</h3>
              <div className="space-y-1">
                <p className="font-bold">JONES CONSTRUCTION</p>
                <p>456 OAK AVENUE</p>
                <p>SOMEWHERE, ST 67890</p>
                <p>mike@jonesconstruction.com</p>
                <p>(555) 987-6543</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border-2 border-grit-300 mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-grit-200">
                  <th className="text-left p-4 font-bold uppercase">DESCRIPTION</th>
                  <th className="text-right p-4 font-bold uppercase w-20">QTY</th>
                  <th className="text-right p-4 font-bold uppercase w-24">RATE</th>
                  <th className="text-right p-4 font-bold uppercase w-24">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-grit-200">
                  <td className="p-4">BATHROOM PLUMBING INSTALLATION</td>
                  <td className="text-right p-4">1</td>
                  <td className="text-right p-4">$2,500.00</td>
                  <td className="text-right p-4 font-bold">$2,500.00</td>
                </tr>
                <tr className="border-b border-grit-200">
                  <td className="p-4">ADDITIONAL FITTINGS & LABOR</td>
                  <td className="text-right p-4">3</td>
                  <td className="text-right p-4">$150.00</td>
                  <td className="text-right p-4 font-bold">$450.00</td>
                </tr>
                <tr className="bg-grit-100">
                  <td colSpan={3} className="text-right p-4 font-bold uppercase">TOTAL:</td>
                  <td className="text-right p-4 font-bold text-xl">$2,950.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms */}
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-bold uppercase mb-2">PAYMENT TERMS:</h4>
              <p>NET 30 DAYS. LATE PAYMENTS SUBJECT TO 1.5% MONTHLY CHARGE.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase mb-2">THANK YOU FOR YOUR BUSINESS!</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}