'use client';

import React, { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { PortalSidebar, NavItem } from '@/components/layout/PortalSidebar';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  MOCK_PHARMACY_INVENTORY,
  MOCK_PHARMACY_ORDERS,
} from '@/lib/mock-data';
import { PharmacyInventoryItem, PharmacyOrder, OrderFulfillmentStatus } from '@/types/pharmacy';

export default function PharmacyPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inventory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inventory state
  const [inventory, setInventory] = useState<PharmacyInventoryItem[]>(MOCK_PHARMACY_INVENTORY);
  const [inventoryFilter, setInventoryFilter] = useState<'All' | 'LowStock' | 'RxOnly'>('All');

  // Orders state
  const [orders, setOrders] = useState<PharmacyOrder[]>(MOCK_PHARMACY_ORDERS);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);

  // New Item Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemStrength, setNewItemStrength] = useState('');
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemPrice, setNewItemPrice] = useState(15.0);
  const [newItemExpiry, setNewItemExpiry] = useState('2028-12-31');
  const [newItemIsRx, setNewItemIsRx] = useState(true);

  const navItems: NavItem[] = [
    { id: 'inventory', label: 'Inventory Control', icon: Package, badge: inventory.length },
    { id: 'orders', label: 'Order Fulfillment', icon: ShoppingCart, badge: orders.filter((o) => o.fulfillmentStatus !== 'Fulfilled').length },
    { id: 'marketplace', label: 'Patient Discovery View', icon: Store },
  ];

  // ACTION: Add new item to inventory
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PharmacyInventoryItem = {
      id: 'inv-' + Date.now(),
      medicineName: newItemName,
      brand: newItemBrand || 'Generic Formulary',
      strength: newItemStrength || 'Standard',
      form: 'Tablet',
      quantity: Number(newItemQty),
      price: Number(newItemPrice),
      expiryDate: newItemExpiry,
      isAvailable: Number(newItemQty) > 0,
      requiresPrescription: newItemIsRx,
      stockFreshnessDays: 0,
      batchNumber: 'BAT-' + Math.floor(1000 + Math.random() * 9000),
    };

    setInventory((prev) => [newItem, ...prev]);
    setIsAddItemModalOpen(false);
    toast({
      type: 'success',
      title: 'Inventory Stock Added',
      message: `${newItem.medicineName} added with ${newItem.quantity} units in stock.`,
    });

    setNewItemName('');
    setNewItemBrand('');
    setNewItemStrength('');
  };

  // ACTION: Update order status
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderFulfillmentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: nextStatus } : o))
    );
    toast({
      type: 'success',
      title: 'Order Status Updated',
      message: `Order transitioned to ${nextStatus}. Patient notification sent.`,
    });
    setSelectedOrder(null);
  };

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    if (inventoryFilter === 'LowStock') return matchesSearch && item.quantity <= 10;
    if (inventoryFilter === 'RxOnly') return matchesSearch && item.requiresPrescription;
    return matchesSearch;
  });

  const lowStockCount = inventory.filter((i) => i.quantity <= 10).length;
  const pendingOrdersCount = orders.filter((o) => o.fulfillmentStatus !== 'Fulfilled').length;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PortalSidebar
        portalId="pharmacy"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader
          portalName="Dispensary & Marketplace Portal"
          userName="CarePoint Pharmacy"
          userRole="Licensed Dispensary #PH-9821"
          userAvatarLetter="CP"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          searchPlaceholder="Search inventory, batches, orders..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Pharmacy Marketplace &amp; Fulfillment
                </h1>
                <Badge variant="primary" size="sm">
                  Verified Dispensary
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Maintain accurate stock freshness, verify digital prescriptions, and dispatch orders without automatic substitution.
              </p>
            </div>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Medicine Stock
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Medicines"
              value={inventory.length}
              subtitle="Registered formulary items"
              icon={Package}
              colorScheme="blue"
            />
            <MetricCard
              title="Available Stock"
              value={inventory.filter((i) => i.isAvailable && i.quantity > 0).length}
              subtitle="Ready for fulfillment"
              icon={CheckCircle2}
              colorScheme="green"
            />
            <MetricCard
              title="Low Stock Alerts"
              value={lowStockCount}
              subtitle="Requires supplier re-order"
              icon={AlertTriangle}
              colorScheme="amber"
            />
            <MetricCard
              title="Active Orders"
              value={pendingOrdersCount}
              subtitle="In verification / prep"
              icon={ShoppingCart}
              colorScheme="blue"
            />
          </div>

          {/* TAB 1: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inventory Formulary &amp; Stock Levels</h3>
                  <p className="text-xs text-slate-500">
                    Stock freshness days indicate verification timestamp. Exact quantities must be confirmed before fulfillment.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['All', 'LowStock', 'RxOnly'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setInventoryFilter(filter)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                        inventoryFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'All' ? 'All Items' : filter === 'LowStock' ? 'Low Stock (<10)' : 'Prescription Only'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">Medicine &amp; Brand</th>
                      <th className="py-3 px-4">Strength &amp; Form</th>
                      <th className="py-3 px-4">Available Quantity</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">Prescription Required?</th>
                      <th className="py-3 px-4">Stock Freshness</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4 text-right">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => {
                      const isLowStock = item.quantity <= 10 && item.quantity > 0;
                      const isOutOfStock = item.quantity === 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.medicineName}</div>
                            <div className="text-[10px] text-slate-500">Brand: {item.brand}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.strength} &bull; {item.form}
                          </td>
                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <Badge variant="danger" size="sm">Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" size="sm">{item.quantity} (Low Stock)</Badge>
                            ) : (
                              <span className="font-bold text-slate-800">{item.quantity} units</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {item.requiresPrescription ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                Rx Required
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            Verified {item.stockFreshnessDays === 0 ? 'Today' : `${item.stockFreshnessDays}d ago`}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{item.expiryDate}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 text-[10px]">
                            {item.batchNumber}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Patient Dispensary Orders</h3>
                  <p className="text-xs text-slate-500">
                    Verify digital prescription references before approving medication release.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{ord.orderNumber}</span>
                        <Badge
                          variant={
                            ord.fulfillmentStatus === 'Fulfilled'
                              ? 'success'
                              : ord.fulfillmentStatus === 'Ready for Pickup'
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {ord.fulfillmentStatus}
                        </Badge>
                        <span className="text-xs text-slate-400">&bull; {ord.deliveryType}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1">Patient: {ord.patientName}</h4>
                      <div className="text-xs text-slate-600">
                        {ord.medicines.map((m, i) => (
                          <span key={i}>
                            {m.name} (Qty: {m.quantity})
                            {i < ord.medicines.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>

                      {ord.prescriptionRef && (
                        <p className="text-[11px] text-blue-800 font-semibold mt-1">
                          Ref: {ord.prescriptionRef}
                        </p>
                      )}

                      <span className="text-[10px] text-slate-400 block mt-1">Ordered on {ord.orderDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">${ord.totalAmount.toFixed(2)}</div>
                        <span className="text-[10px] text-green-700 font-bold">{ord.paymentStatus}</span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Process Order &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PATIENT MEDICINE DISCOVERY */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Dispensary Safety &amp; Non-Substitution Policy</h4>
                  <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                    Stock freshness is updated regularly by licensed dispensaries; exact availability must be confirmed
                    upon arrival. Prescription-only medicines require pharmacist verification. PillReminder does
                    not permit automated medicine substitution without prescribing physician authorization.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Available Formulary Directory</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between hover:border-blue-300 transition">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{item.medicineName}</h4>
                            <span className="text-[11px] text-slate-500">Brand: {item.brand}</span>
                          </div>
                          <span className="text-sm font-extrabold text-blue-700">${item.price.toFixed(2)}</span>
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          {item.strength} &bull; {item.form}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Availability:</span>
                          <span className={item.isAvailable ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
                            {item.isAvailable ? 'In Stock (Fresh)' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">
                          {item.requiresPrescription ? 'Rx Required' : 'Over The Counter'}
                        </span>
                        <button
                          onClick={() => {
                            toast({
                              type: 'info',
                              title: 'Dispensary Reservation',
                              message: `${item.medicineName} reserved for 24h at CarePoint Pharmacy. Present digital prescription at counter.`,
                            });
                          }}
                          disabled={!item.isAvailable}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg text-xs transition"
                        >
                          Reserve Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD MEDICINE STOCK */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Medicine Stock"
        description="Add a new pharmaceutical product to the dispensary inventory."
        maxWidth="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4 text-xs text-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              placeholder="e.g. Lisinopril, Metformin"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Zestril, Glucophage"
                value={newItemBrand}
                onChange={(e) => setNewItemBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Strength</label>
              <input
                type="text"
                placeholder="e.g. 10 mg, 500 mg"
                value={newItemStrength}
                onChange={(e) => setNewItemStrength(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min={1}
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={newItemExpiry}
              onChange={(e) => setNewItemExpiry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRxCheck"
              checked={newItemIsRx}
              onChange={(e) => setNewItemIsRx(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRxCheck" className="text-xs font-semibold text-slate-700">
              Requires valid digital prescription for dispensing
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
            >
              Save to Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PROCESS ORDER */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order: ${selectedOrder.orderNumber}`}
          description={`Patient: ${selectedOrder.patientName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-900 block">Prescription Verification</span>
              <p className="text-[11px] text-blue-800 mt-0.5">
                {selectedOrder.prescriptionRef || 'Over-the-counter order (No Rx required)'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Medicines in Order</span>
              {selectedOrder.medicines.map((m, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">{m.name} x {m.quantity}</span>
                  <span className="font-bold">${(m.unitPrice * m.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span>${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-800 block">Transition Fulfillment Status:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Ready for Pickup')}
                  className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold hover:bg-blue-100 transition"
                >
                  Mark Ready for Pickup
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Fulfilled')}
                  className="p-2 rounded-lg bg-green-50 text-green-800 border border-green-200 font-bold hover:bg-green-100 transition"
                >
                  Mark as Fulfilled
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
