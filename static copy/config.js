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

// export const discreteHeaders = [
//   'Steel-concrete interface information: Concrete characteristics at corrosion spot',
//   'Steel-concrete interface information: Steel characteristics at corrosion spot',
//   'Orientation of corrosion spot with respect to structure', 
//   'Cement type',
//   'Exposure class',
//   'Non-carbonated cover depth [mm]'
// ]

// export const nonDiscreteHeaders = [
//   'Steel bar diameter [mm]',
//   'Cover depth [mm]',
//   'Concrete resistivity [Ohm m]',
//   'Meters above sea level [m a.s.l.]'
// ]

export const parameters = [
  {
    label: 'Steel-concrete interface information: Concrete characteristics at corrosion spot',
    discrete: true
  },
  {
    label: 'Steel-concrete interface information: Steel characteristics at corrosion spot',
    discrete: true
  },
  {
    label: 'Orientation of corrosion spot with respect to structure',
    discrete: true
  },
  {
    label: 'Steel bar diameter [mm]',
    discrete: false
  },
  {
    label: 'Cover depth [mm]',
    discrete: false
  },
  {
    label: 'Non-carbonated cover depth [mm]',
    discrete: true
  },
  {
    label: 'Cement type',
    discrete: true
  },
  {
    label: 'Concrete resistivity [Ohm m]',
    discrete: false
  },
  {
    label: 'Exposure class',
    discrete: true
  }, 
  {
    label: 'Meters above sea level [m a.s.l.]',
    discrete: false
  }
]

export const structurenameColorMap = d3.scaleOrdinal()
  .domain(structurenames)
  .range(d3.schemeTableau10);