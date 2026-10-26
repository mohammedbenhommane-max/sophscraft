// Conditions de vente utilisées par les données structurées Google (et le futur flux Google Shopping).
// À garder cohérent avec les CGV (app/[locale]/cgv/page.tsx).

// Livraison offerte dans toute l'Europe (pays de l'Union européenne)
export const SHIPPING_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]
export const SHIPPING_PRICE = 0
// 3 à 4 jours ouvrés au total : préparation (0-1 jour) + transport (3 jours)
export const HANDLING_DAYS = { min: 0, max: 1 }
export const TRANSIT_DAYS = { min: 3, max: 3 }
export const RETURN_DAYS = 30

const days = (range: { min: number; max: number }) => ({
  '@type': 'QuantitativeValue',
  minValue: range.min,
  maxValue: range.max,
  unitCode: 'DAY',
})

export const offerShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: SHIPPING_PRICE, currency: 'EUR' },
  shippingDestination: SHIPPING_COUNTRIES.map((country) => ({ '@type': 'DefinedRegion', addressCountry: country })),
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: days(HANDLING_DAYS),
    transitTime: days(TRANSIT_DAYS),
  },
}

export const merchantReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: SHIPPING_COUNTRIES,
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: RETURN_DAYS,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
}
