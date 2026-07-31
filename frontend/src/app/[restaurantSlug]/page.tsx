export default function RestaurantHome({ params }: { params: { restaurantSlug: string } }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to {params.restaurantSlug}</h1>
      <p>Restaurant features will be displayed here based on config.</p>
    </div>
  );
}
