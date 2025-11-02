import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Turn Waste Into Worth ♻️
      </h1>
      <p className="text-gray-600 mb-6 text-center w-3/4">
        Book instant pickups for electronics, metals, plastics & more. 
        Get fair prices while building a sustainable future.
      </p>

      <div className="flex gap-4">
        <Link
          to="/book"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md shadow-md"
        >
          Book Pickup Now
        </Link>

        <Link
          to="/login"
          className="border border-green-600 text-green-600 hover:bg-green-100 py-2 px-4 rounded-md"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
