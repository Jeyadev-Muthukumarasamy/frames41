import type { OrderStep, OrderStepStatus } from '../../types/order'
import Icon from '../ui/Icon'

interface StepIndicatorProps {
  status: OrderStepStatus
  stepNumber: number
  isLast: boolean
}

function StepIndicator({ status, stepNumber, isLast }: StepIndicatorProps) {
  const base =
    'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0'

  const indicator =
    status === 'complete' ? (
      <div className={`${base} border-primary bg-primary`}>
        <Icon name="check" className="text-on-primary text-sm" />
      </div>
    ) : status === 'active' ? (
      <div className={`${base} border-primary text-primary font-bold text-xs`}>
        {stepNumber}
      </div>
    ) : (
      <div className={`${base} border-outline-variant text-on-surface-variant font-bold text-xs`}>
        {stepNumber}
      </div>
    )

  return (
    <div className="flex flex-col items-center">
      {indicator}
      {!isLast && (
        <div className="w-px h-16 bg-outline-variant mt-2" aria-hidden="true" />
      )}
    </div>
  )
}

interface OrderProgressTrackerProps {
  steps: ReadonlyArray<OrderStep>
}

export default function OrderProgressTracker({ steps }: OrderProgressTrackerProps) {
  return (
    <ol aria-label="Order progress" className="list-none p-0 space-y-10">
      {steps.map((step, index) => (
        <li
          key={step.id}
          aria-current={step.status === 'active' ? 'step' : undefined}
          className="flex gap-6"
        >
          <StepIndicator
            status={step.status}
            stepNumber={index + 1}
            isLast={index === steps.length - 1}
          />
          <div className="pt-1">
            <h5
              className={`text-label-bold uppercase tracking-widest mb-2 ${
                step.status === 'pending' ? 'text-on-surface-variant' : 'text-on-background'
              }`}
            >
              {step.label}
            </h5>
            <p className="text-body-md text-on-surface-variant">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
