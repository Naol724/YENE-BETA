import React from 'react';

const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Studio'] as const;

export type PriceRange = { min: number; max: number };

type Props = {
  priceRange: PriceRange;
  onPriceRangeChange: (r: PriceRange) => void;
  beds: number;
  onBedsChange: (n: number) => void;
  propertyType: string;
  onPropertyTypeChange: (t: string) => void;
  onApply: () => void;
  onClose?: () => void;
  showClose?: boolean;
  currencyLabel?: string;
  /** When false, omit the Apply button (parent renders it in a fixed footer). */
  showApplyButton?: boolean;
};

export const FilterSidebar: React.FC<Props> = ({
  priceRange,
  onPriceRangeChange,
  beds,
  onBedsChange,
  propertyType,
  onPropertyTypeChange,
  onApply,
  onClose,
  showClose,
  currencyLabel = 'ETB / mo',
  showApplyButton = true,
}) => (
  <div className="space-y-6 lg:space-y-4">
    {showClose ? (
      <div className="flex justify-between items-center mb-2 md:hidden">
        <h3 className="font-bold text-lg text-brandNavy dark:text-white">Filters</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-error text-sm font-medium"
        >
          Close
        </button>
      </div>
    ) : null}

    <div>
      <label className="font-semibold block mb-3 lg:mb-2 text-sm lg:text-[13px] text-brandNavy dark:text-white">
        Property type
      </label>
      <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
        <button
          type="button"
          onClick={() => onPropertyTypeChange('')}
          className={`h-9 lg:h-9 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
            !propertyType
              ? 'bg-brandTeal border-brandTeal text-white'
              : 'border-border dark:border-slate-600 bg-white dark:bg-darksurface text-brandNavy dark:text-slate-200'
          }`}
        >
          Any
        </button>
        {PROPERTY_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPropertyTypeChange(t)}
            className={`h-9 rounded-lg border text-[11px] sm:text-xs font-medium transition-all px-0.5 sm:px-1 ${
              propertyType === t
                ? 'bg-brandTeal border-brandTeal text-white'
                : 'border-border dark:border-slate-600 bg-white dark:bg-darksurface text-brandNavy dark:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="font-semibold block mb-3 lg:mb-2 text-sm lg:text-[13px] text-brandNavy dark:text-white">
        Price range ({currencyLabel})
      </label>
      <input
        type="range"
        min={0}
        max={200000}
        step={1000}
        value={priceRange.max}
        onChange={(e) => onPriceRangeChange({ ...priceRange, max: parseInt(e.target.value, 10) })}
        className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-brandTeal"
      />
      <div className="flex justify-between text-sm text-textSecondary dark:text-darkmuted mt-2">
        <span>0</span>
        <span>{priceRange.max.toLocaleString()}+</span>
      </div>
    </div>

    <div>
      <label className="font-semibold block mb-3 lg:mb-2 text-sm lg:text-[13px] text-brandNavy dark:text-white">
        Bedrooms
      </label>
      <div className="flex gap-1.5 lg:gap-2 flex-wrap">
        {[0, 1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onBedsChange(num)}
            className={`flex-1 min-w-[2.5rem] sm:min-w-[3rem] h-9 lg:h-9 rounded-lg border transition-all text-xs sm:text-sm font-medium ${
              beds === num
                ? 'bg-brandTeal border-brandTeal text-white'
                : 'border-border dark:border-slate-600 bg-white dark:bg-darksurface text-brandNavy dark:text-slate-200'
            }`}
          >
            {num === 0 ? 'Any' : `${num}+`}
          </button>
        ))}
      </div>
    </div>

    {showApplyButton ? (
      <button
        type="button"
        onClick={onApply}
        className="btn-teal w-full justify-center !h-11 lg:!h-10 text-sm"
      >
        Apply filters
      </button>
    ) : null}
  </div>
);

export default FilterSidebar;
