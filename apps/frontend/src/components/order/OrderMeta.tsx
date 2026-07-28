interface MetaField {
  readonly label: string
  readonly value: string
}

interface OrderMetaProps {
  fields: ReadonlyArray<MetaField>
}

export default function OrderMeta({ fields }: OrderMetaProps) {
  const lastIndex = fields.length - 1

  return (
    <dl className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {fields.map(({ label, value }, index) => (
        <div key={label} className={index === lastIndex ? 'col-span-2 md:col-span-1' : ''}>
          <dt className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
            {label}
          </dt>
          <dd className="text-body-md font-bold text-on-background">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
