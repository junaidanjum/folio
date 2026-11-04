import { Check, ChevronDown } from 'lucide-react'
import { Select } from '@base-ui/react/select'

type SelectOption<Value extends string> = {
  label: string
  value: Value
}

type FolioSelectProps<Value extends string> = {
  className?: string
  label: string
  onValueChange: (value: Value) => void
  options: ReadonlyArray<SelectOption<Value>>
  value: Value
}

export const FolioSelect = <Value extends string>({ className = '', label, onValueChange, options, value }: FolioSelectProps<Value>) => (
  <div className={className}>
    <Select.Root items={options} value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}>
      <Select.Trigger className="folio-select-trigger" aria-label={label}>
        <Select.Value className="folio-select-value" />
        <Select.Icon className="folio-select-icon">
          <ChevronDown size={13} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="folio-select-positioner" sideOffset={6} alignItemWithTrigger={false}>
          <Select.Popup className="folio-select-popup">
            <Select.List className="folio-select-list">
              <Select.Group>
                {options.map((option) => (
                  <Select.Item className="folio-select-item" key={option.value} value={option.value}>
                    <Select.ItemIndicator className="folio-select-indicator">
                      <Check size={13} />
                    </Select.ItemIndicator>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </div>
)
