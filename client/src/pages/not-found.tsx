import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-red-600">404 - Page Not Found</h1>
      <p className="mb-4 text-gray-600">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Go Home
      </Link>
    </div>
  );
}
