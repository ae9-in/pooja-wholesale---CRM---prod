import { useState } from "react";
import { cityAreaMap } from "../../constants/domain";

type Props = {
  value: { zone: string; place: string };
  onChange: (val: { zone: string; place: string }) => void;
};

export function ZonePlacePicker({ value, onChange }: Props) {
  const [openZone, setOpenZone] = useState<string | null>(value.zone || null);

  const handleZoneClick = (zone: string) => {
    setOpenZone(openZone === zone ? null : zone);
    if (zone !== value.zone) {
      onChange({ zone, place: "" });
    }
  };

  const handlePlaceClick = (zone: string, place: string) => {
    onChange({ zone, place });
  };

  const zones = Object.keys(cityAreaMap);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Selected display */}
      {value.zone && (
        <div className="px-4 py-2 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
          <span className="text-sm font-medium text-brand-700">
            {value.zone}
            {value.place ? ` → ${value.place}` : " (select a place below)"}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange({ zone: "", place: "" });
              setOpenZone(null);
            }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Zone list */}
      <div className="divide-y divide-slate-100">
        {zones.map((zone) => {
          const places = cityAreaMap[zone] ?? [];
          const isOpen = openZone === zone;
          const isSelected = value.zone === zone;

          return (
            <div key={zone}>
              {/* Zone row */}
              <button
                type="button"
                onClick={() => handleZoneClick(zone)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-slate-50 ${
                  isSelected ? "text-brand-700 bg-brand-50/50" : "text-slate-700"
                }`}
              >
                <span>{zone}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-normal text-slate-400">{places.length} places</span>
                  <span
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ display: "inline-block" }}
                  >
                    ▾
                  </span>
                </span>
              </button>

              {/* Place list — expands when zone is open */}
              {isOpen && (
                <div className="bg-slate-50 px-3 pb-3 pt-1 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {places.map((place) => {
                    const isPlaceSelected = value.zone === zone && value.place === place;
                    return (
                      <button
                        key={place}
                        type="button"
                        onClick={() => handlePlaceClick(zone, place)}
                        className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-all border ${
                          isPlaceSelected
                            ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-700"
                        }`}
                      >
                        {place}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
