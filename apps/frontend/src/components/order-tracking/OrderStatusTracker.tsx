import type { TrackingStep } from '../../types/ordertracking'
import Icon from '../ui/Icon'

interface StepNodeProps {
  step: TrackingStep
}

function StepNode({ step }: StepNodeProps) {
  const { status, icon, label, timestamp } = step

  const nodeEl =
    status === 'complete' ? (
      <div className="w-10 h-10 rounded-full bg-[#111110] text-white flex items-center justify-center flex-shrink-0">
        <Icon name="check" className="text-[20px]" filled aria-label="Completed" />
      </div>
    ) : status === 'active' ? (
      <div className="w-12 h-12 rounded-full border-2 border-[#FF4500] bg-white flex items-center justify-center ring-8 ring-white flex-shrink-0">
        <Icon name={icon} className="text-[#FF4500]" aria-label="Current step" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#EEEEEC] text-[#8A8A85] flex items-center justify-center flex-shrink-0">
        <Icon name={icon} className="text-[20px]" />
      </div>
    )

  const labelColor = status === 'active' ? 'text-[#FF4500]' : 'text-[#111110]'
  const timeColor = status === 'active' ? 'text-[#FF4500]' : 'text-secondary'

  return (
    <li
      className={[
        'relative z-10 flex md:flex-col items-center gap-4 flex-1',
        status === 'upcoming' ? 'opacity-40' : '',
      ].join(' ')}
      aria-current={status === 'active' ? 'step' : undefined}
    >
      {nodeEl}
      <div className="text-left md:text-center">
        <p className={`font-label-bold mb-1 ${labelColor}`}>{label}</p>
        <p className={`text-label-sm ${timeColor}`}>{timestamp}</p>
      </div>
    </li>
  )
}

interface OrderStatusTrackerProps {
  steps: ReadonlyArray<TrackingStep>
}

export default function OrderStatusTracker({ steps }: OrderStatusTrackerProps) {
  const activeLabel = steps.find((s) => s.status === 'active')?.label ?? 'Order in progress'

  return (
    <section
      aria-label="Order status"
      className="bg-surface-container-lowest border border-[#E2E2DE] p-8 md:p-12 mb-gutter"
    >
      <ol
        aria-label={`Order progress — currently: ${activeLabel}`}
        className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 list-none p-0 m-0"
      >
        <div
          className="absolute top-1/2 left-0 w-full h-[2px] bg-[#EEEEEC] -translate-y-1/2 hidden md:block z-0"
          aria-hidden="true"
        />
        {steps.map((step) => (
          <StepNode key={step.id} step={step} />
        ))}
      </ol>
    </section>
  )
}
