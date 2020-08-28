export const structurenames = [
  'T1-C1-H', 'T2-W1-V', 'T2-W2-V', 'B3-A1-V', 'B3-A1-H', 'T4-S1-H',
  'B1-E1-H_and_B1-E2-H', 'T3-W1-V', 'T3-W2-V'
];

export const sortableHeaders = [
  // 'Structure code',
  'Year of construction',
  'Location',
  'Meters above sea level [m a.s.l.]',
  'Type of structure',
  'Element',
  'w/b ratio',
  'Aggregates'
]

export const discreteHeaders = [
  'Steel-concrete interface information: Concrete at corrosion spot',
  'Steel-concrete interface information: Steel at corrosion spot',
  'Steel-concrete interface information: Concrete not at corrosion spot',
  'Non-carbonated cover depth [mm]',
  'Orientation of corrosion spot with respect to structure', 
  'Exposure class',
  'Cement type'
]

export const nonDiscreteHeaders = [
  'Cover depth [mm]',
  'Meters above sea level [m a.s.l.]',
  'Steel bar diameter [mm]',
  'Steel potential at beginning of exposure [mV vs. Ag/AgClsat]',
  'Steel potential at end of exposure [mV vs. Ag/AgClsat]',
  'Steel potential at beginning of exposure [mV vs. Ag/AgClsat]',
  'Concrete resistivity [Ohm m]',
]

export const structurenameColorMap = d3.scaleOrdinal()
  .domain(structurenames)
  .range(d3.schemeTableau10);