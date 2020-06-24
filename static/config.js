export const filenames = [
  'T1-C1-H', 'T2-W1-V', 'T2-W2-V', 'B3-A1-V', 'B3-A1-H', 'T4-S1-H',
  'B1-E1-H_and_B1-E2-H', 'T3-W1-V', 'T3-W2-V'
];

export const getSampleData = async () => {
  return d3.json('./data/sample_data.json')
}

export const sortableHeaders = [
  // 'Structure code',
  'Year of construction', 'Location', 'Meters above sea level [m a.s.l.]', 'Type of structure', 'Element', 'w/b ratio', 'Aggregates'
]