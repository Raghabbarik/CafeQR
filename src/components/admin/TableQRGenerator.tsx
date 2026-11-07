import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { CafeInfo } from '../../types';
import { Printer, ExternalLink, Plus, Sparkles } from 'lucide-react';

interface TableQRGeneratorProps {
  cafe: CafeInfo;
  onSelectTableForTest: (table: string) => void;
  onUpdateTablesCount: (count: number) => Promise<void>;
}

export const TableQRGenerator: React.FC<TableQRGeneratorProps> = ({
  cafe,
  onSelectTableForTest,
  onUpdateTablesCount,
}) => {
  const [tablesCount, setTablesCount] = useState<number>(cafe.tablesCount || 12);
  const [selectedPrintTable, setSelectedPrintTable] = useState<number | 'all'>('all');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const getTableUrl = (tableNum: number) => `${origin}/?table=${tableNum}`;

  const handlePrintAll = () => {
    setSelectedPrintTable('all');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintSingle = (tableNum: number) => {
    setSelectedPrintTable(tableNum);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleAddTable = async () => {
    const newCount = tablesCount + 1;
    setTablesCount(newCount);
    await onUpdateTablesCount(newCount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls (Hidden on print) */}
      <div className="no-print bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Table QR Code Tent Cards</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Place these QR tent cards on your cafe tables. Customers scan them with their phone camera to order directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTable}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table #{tablesCount + 1}</span>
          </button>

          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All QR Cards</span>
          </button>
        </div>
      </div>

      {/* Grid of Table QR Tent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: tablesCount }, (_, i) => i + 1).map((tableNum) => {
          const url = getTableUrl(tableNum);
          const isSelectedForPrint = selectedPrintTable === 'all' || selectedPrintTable === tableNum;

          return (
            <div
              key={tableNum}
              className={`bg-white rounded-3xl border border-stone-200/90 shadow-md p-5 text-center flex flex-col justify-between items-center transition-all hover:shadow-lg ${
                !isSelectedForPrint ? 'no-print' : ''
              }`}
            >
              {/* Tent Card Branding */}
              <div className="w-full space-y-1 pb-3 border-b border-stone-100">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={cafe.logo}
                    alt={cafe.name}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                  <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                    {cafe.name}
                  </h4>
                </div>
                <div className="inline-block bg-amber-900 text-white font-black text-sm px-3 py-0.5 rounded-full mt-1">
                  Table #{tableNum}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="py-4">
                <div className="p-3 bg-white rounded-2xl border-2 border-stone-800 shadow-inner inline-block">
                  <QRCodeSVG
                    value={url}
                    size={140}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: cafe.logo,
                      x: undefined,
                      y: undefined,
                      height: 28,
                      width: 28,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-[11px] font-bold text-stone-800 mt-2">
                  Scan to View Menu & Order
                </p>
                <p className="text-[10px] text-stone-400 font-mono">
                  No app download needed
                </p>
              </div>

              {/* Tent Card Footer & Interactive actions */}
              <div className="w-full pt-3 border-t border-stone-100 space-y-2">
                <p className="text-[10px] text-amber-900/80 font-serif italic line-clamp-1">
                  "{cafe.tagline}"
                </p>

                {/* Buttons (Hidden on print) */}
                <div className="flex items-center gap-1.5 no-print pt-1">
                  <button
                    onClick={() => onSelectTableForTest(String(tableNum))}
                    className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Simulate customer opening this table QR"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test Scan</span>
                  </button>
                  <button
                    onClick={() => handlePrintSingle(tableNum)}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors cursor-pointer"
                    title="Print this single table tent card"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
