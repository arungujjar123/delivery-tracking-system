import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Navigation, 
  Weight, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Crosshair,
  Building2,
  Check
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import LiveMap from '../components/LiveMap';
import toast from 'react-hot-toast';

const PRESET_LOCATIONS = [
  { name: 'Delhi NCR Hub', address: 'Connaught Place, Central Delhi, Delhi 110001', lat: 28.6315, lng: 77.2167 },
  { name: 'Mumbai Terminal', address: 'BKC, Bandra Kurla Complex, Mumbai 400051', lat: 19.0657, lng: 72.8686 },
  { name: 'Bengaluru Tech Hub', address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034', lat: 12.9352, lng: 77.6245 },
  { name: 'Chennai Central', address: 'Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600002', lat: 13.0604, lng: 80.2496 },
  { name: 'Kolkata Port', address: 'Park Street, Kolkata, West Bengal 700016', lat: 22.5535, lng: 88.3516 },
  { name: 'Hyderabad Hub', address: 'Hitec City, Madhapur, Hyderabad, Telangana 500081', lat: 17.4474, lng: 78.3762 },
];

const PlaceOrder = () => {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState({
    address: 'BKC, Bandra Kurla Complex, Mumbai 400051',
    lat: 19.0657,
    lng: 72.8686,
  });

  const [drop, setDrop] = useState({
    address: 'Connaught Place, Central Delhi, Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
  });

  const [packageDetails, setPackageDetails] = useState({
    description: 'High-Value Electronics & Gadgets',
    weight: '3.5',
  });

  const [selectionTarget, setSelectionTarget] = useState('pickup'); // 'pickup' or 'drop'
  const [submitting, setSubmitting] = useState(false);

  const handleMapClick = (latlng) => {
    const lat = Number(latlng.lat.toFixed(4));
    const lng = Number(latlng.lng.toFixed(4));

    if (selectionTarget === 'pickup') {
      setPickup((prev) => ({
        ...prev,
        lat,
        lng,
        address: prev.address || `GPS: ${lat}, ${lng}`,
      }));
      toast.success('Pickup coordinates updated from map');
    } else {
      setDrop((prev) => ({
        ...prev,
        lat,
        lng,
        address: prev.address || `GPS: ${lat}, ${lng}`,
      }));
      toast.success('Destination coordinates updated from map');
    }
  };

  const applyPreset = (preset, target) => {
    if (target === 'pickup') {
      setPickup({
        address: preset.address,
        lat: preset.lat,
        lng: preset.lng,
      });
      toast.success(`Pickup set to ${preset.name}`);
    } else {
      setDrop({
        address: preset.address,
        lat: preset.lat,
        lng: preset.lng,
      });
      toast.success(`Drop set to ${preset.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pickup.address.trim()) {
      toast.error('Please enter a valid pickup address');
      return;
    }
    if (!drop.address.trim()) {
      toast.error('Please enter a valid drop address');
      return;
    }
    if (!packageDetails.description.trim()) {
      toast.error('Please describe the package');
      return;
    }

    const payload = {
      pickupAddress: {
        address: pickup.address.trim(),
        lat: Number(pickup.lat),
        lng: Number(pickup.lng),
      },
      dropAddress: {
        address: drop.address.trim(),
        lat: Number(drop.lat),
        lng: Number(drop.lng),
      },
      packageDetails: {
        description: packageDetails.description.trim(),
        weight: Number(packageDetails.weight) || 1,
      },
    };

    try {
      setSubmitting(true);
      const res = await ordersAPI.createOrder(payload);
      const createdOrder = res.data?.order || res.data;
      const orderId = createdOrder?._id || createdOrder?.id;

      toast.success('Shipment booked successfully!');
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      const msg = error.response?.data?.message || 'Failed to book shipment. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Dispatch Booking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Book a New Delivery
            </h1>
            <p className="text-sm text-slate-500">
              Provide pickup and drop coordinates along with parcel specifications
            </p>
          </div>
        </div>

        {/* Quick City Presets */}
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick Metro Presets (Click to apply)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_LOCATIONS.map((preset) => (
              <div key={preset.name} className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 p-1 text-xs">
                <span className="font-semibold text-slate-700 px-2">{preset.name}</span>
                <button
                  type="button"
                  onClick={() => applyPreset(preset, 'pickup')}
                  className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[11px] transition-colors"
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(preset, 'drop')}
                  className="ml-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] transition-colors"
                >
                  Drop
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form and Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pickup Section */}
              <div className="rounded-2xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      1. Pickup Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectionTarget('pickup')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      selectionTarget === 'pickup'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    {selectionTarget === 'pickup' ? 'Map Target Active' : 'Click Map to Set'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickup.address}
                    onChange={(e) => setPickup((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Enter pickup address, warehouse or building"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">Pickup Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={pickup.lat}
                      onChange={(e) => setPickup((p) => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">Pickup Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={pickup.lng}
                      onChange={(e) => setPickup((p) => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Section */}
              <div className="rounded-2xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Destination Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectionTarget('drop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      selectionTarget === 'drop'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    {selectionTarget === 'drop' ? 'Map Target Active' : 'Click Map to Set'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Destination Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={drop.address}
                    onChange={(e) => setDrop((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Enter delivery address or landmark"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">Drop Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={drop.lat}
                      onChange={(e) => setDrop((p) => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">Drop Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={drop.lng}
                      onChange={(e) => setDrop((p) => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="rounded-2xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    3. Package Specifications
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Item Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={packageDetails.description}
                    onChange={(e) => setPackageDetails((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Document, Electronics, Clothes, Medicine"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={packageDetails.weight}
                    onChange={(e) => setPackageDetails((p) => ({ ...p, weight: e.target.value }))}
                    placeholder="e.g. 2.5"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-101 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Booking Shipment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Shipment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Live Map Preview */}
          <div className="lg:col-span-6 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Route & Location Preview</h3>
                  <p className="text-xs text-slate-500">
                    Click anywhere on the map to place the selected marker ({selectionTarget})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Pickup
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Drop
                  </span>
                </div>
              </div>

              <div className="h-[460px] w-full rounded-2xl overflow-hidden">
                <LiveMap
                  pickup={pickup}
                  drop={drop}
                  onMapClick={handleMapClick}
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
