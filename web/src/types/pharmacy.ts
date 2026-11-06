export interface PharmacyInventoryItem {
  id: string;
  medicineName: string;
  brand: string;
  strength: string;
  form: string;
  quantity: number;
  price: number;
  expiryDate: string;
  isAvailable: boolean;
  requiresPrescription: boolean;
  stockFreshnessDays: number; // Days since last stock count verification
  batchNumber: string;
}

export type OrderFulfillmentStatus = 'Pending Verification' | 'Pharmacist Review' | 'Ready for Pickup' | 'Out for Delivery' | 'Fulfilled' | 'Cancelled';
export type PaymentStatus = 'Paid Online' | 'Pay on Pickup' | 'Pending';

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientContact: string;
  prescriptionRef?: string;
  medicines: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  orderDate: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  deliveryType: 'Store Pickup' | 'Home Delivery';
  pharmacistNotes?: string;
}

export interface PharmacyStore {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  phone: string;
  operatingHours: string;
  isParticipating: boolean;
  supportsDelivery: boolean;
  inventoryVerifiedDate: string;
}
