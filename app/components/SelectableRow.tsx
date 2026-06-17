import React from 'react';
import ListRow from './ListRow';

interface SelectableRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Suppresses the bottom hairline (use for the final row in a Section). */
  isLast?: boolean;
}

/**
 * A `ListRow` specialised for single-select option lists (language, level,
 * frequency, mode). Thin wrapper that always wires the trailing accent
 * checkmark.
 */
const SelectableRow: React.FC<SelectableRowProps> = ({ label, selected, onPress, isLast }) => (
  <ListRow label={label} selected={selected} onPress={onPress} isLast={isLast} />
);

export default SelectableRow;
