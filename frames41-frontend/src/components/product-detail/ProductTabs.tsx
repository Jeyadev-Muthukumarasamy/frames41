import type { ProductTab, ProductTabId } from '../../types/productDetail'

interface ProductTabsProps {
  readonly tabs: ReadonlyArray<ProductTab>
  readonly activeTab: ProductTabId
  onTabChange: (id: ProductTabId) => void
}

function parseJsonObject(content: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    return null
  } catch {
    return null
  }
}

function TabContent({ tab }: { tab: ProductTab }) {
  if (tab.id === 'specifications') {
    const specs = parseJsonObject(tab.content)
    if (specs && Object.keys(specs).length > 0) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[300px]">
            <tbody>
              {Object.entries(specs).map(([key, value]) => (
                <tr key={key} className="border-b border-outline-variant last:border-0">
                  <td className="py-3 pr-6 font-semibold text-on-background capitalize w-2/5 whitespace-nowrap">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="py-3 text-on-surface-variant">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  if (!tab.content) {
    return <p className="text-on-surface-variant/60 italic">No information available.</p>
  }

  return (
    <>
      {tab.content.split('\n\n').map((paragraph, i) => (
        <p key={i} className={`text-sm sm:text-base ${i > 0 ? 'mt-4 sm:mt-6' : ''}`}>
          {paragraph}
        </p>
      ))}
    </>
  )
}

export default function ProductTabs({ tabs, activeTab, onTabChange }: ProductTabsProps) {
  const activeContent = tabs.find((t) => t.id === activeTab)

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product details"
        className="flex gap-6 sm:gap-12 mb-6 sm:mb-8 border-b border-outline-variant overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`text-sm sm:text-headline-md font-headline font-bold pb-2 border-b-2 -mb-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-primary text-on-background'
                  : 'border-transparent text-outline hover:text-on-background'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeContent && (
        <div
          role="tabpanel"
          id={`panel-${activeContent.id}`}
          aria-labelledby={`tab-${activeContent.id}`}
          className="text-sm sm:text-body-lg text-on-surface-variant max-w-3xl"
        >
          <TabContent tab={activeContent} />
        </div>
      )}
    </div>
  )
}
