import { useState } from 'react'
import type { CheckoutData } from '../../types/checkout'
import type { AddressFormData } from './AddressFormInline'
import AddressGrid from './AddressGrid'
import DeliveryMethodSelector from './DeliveryMethodSelector'
import OrderSummarySidebar from './OrderSummarySidebar'

export interface CheckoutSubmitParams {
  addressId: string
  deliveryMethodId: string
}

interface CheckoutProps {
  data: CheckoutData
  defaultAddressId: string
  defaultDeliveryId: string
  onProceedToPayment?: (params: CheckoutSubmitParams) => void
  isProceeding?: boolean
  onEditAddress?: (id: string) => void
  onSaveAddress?: (data: AddressFormData) => Promise<unknown>
  couponCode?: string | null
  applyingCoupon?: boolean
  onApplyCoupon?: (code: string) => Promise<number>
  onRemoveCoupon?: () => Promise<void>
}

export default function Checkout({
  data,
  defaultAddressId,
  defaultDeliveryId,
  onProceedToPayment,
  isProceeding = false,
  onEditAddress,
  onSaveAddress,
  couponCode,
  applyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CheckoutProps) {
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(defaultDeliveryId)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const selectedDelivery = data.deliveryMethods.find((m) => m.id === selectedDeliveryId)

  function handleProceed() {
    onProceedToPayment?.({
      addressId: selectedAddressId,
      deliveryMethodId: selectedDeliveryId,
    })
  }

  async function handleSaveAddress(formData: AddressFormData) {
    if (!onSaveAddress) return
    await onSaveAddress(formData)
    setShowAddressForm(false)
  }

  return (
    <main className="pt-32 pb-section px-6 md:px-12 max-w-container-max mx-auto">
      <header className="mb-12">
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Checkout</h1>
        <p className="font-body-md text-body-md text-secondary">
          Select your delivery destination for this order.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <AddressGrid
            addresses={data.addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
            onEdit={(id) => onEditAddress?.(id)}
            onAdd={() => setShowAddressForm(true)}
            showForm={showAddressForm}
            onSaveForm={handleSaveAddress}
            onCancelForm={() => setShowAddressForm(false)}
          />
          <DeliveryMethodSelector
            methods={data.deliveryMethods}
            selectedId={selectedDeliveryId}
            onSelect={setSelectedDeliveryId}
          />
        </div>

        <OrderSummarySidebar
          items={data.lineItems}
          totals={data.totals}
          selectedDelivery={selectedDelivery}
          onProceed={handleProceed}
          canProceed={!!selectedAddressId}
          isProceeding={isProceeding}
          couponCode={couponCode}
          applyingCoupon={applyingCoupon}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      </div>
    </main>
  )
}
