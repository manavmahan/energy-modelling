export default function Footer() {
  return (
    <div className="absolute w-full border-t border-gray-200 bg-white py-5 text-center">
      <p className="text-gray-500">
        {"Copyright "}
        <span>&copy; </span>
        {" 2023 "}
        <a
          className="font-medium text-gray-500 underline transition-colors"
          href="https://www.linkedin.com/in/manav-mahan-singh-871928b1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Manav Mahan Singh
        </a>
      </p>
    </div>
  );
}
