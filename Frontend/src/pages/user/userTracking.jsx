import DeliveryMap from "../components/DeliveryMap";

export default function UserTracking({ order }) {
  if (!order || !order.addressId?.mapDetails) {
    return <p className="text-center mt-10">📍 Address location not available</p>;
  }

  const userLocation = {
    lat: order.addressId.mapDetails.latitude,
    lng: order.addressId.mapDetails.longitude,
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🚚 Track Your Delivery</h2>
      <DeliveryMap orderId={order._id} userLocation={userLocation} />
    </div>
  );
}
