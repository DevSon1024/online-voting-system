export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; {currentYear} VoteChain. All Rights Reserved.</p>
        <p className="text-sm mt-1">A project for 503-01 AWD.</p>
      </div>
    </footer>
  );
}