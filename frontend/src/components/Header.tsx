import Link from 'next/link';

interface HeaderProps {
    showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = true }: HeaderProps) {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-indigo-600">WMS-PUSHER</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {showDashboardLink && (
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                            Dashboard
                        </Link>
                    )}
                    <Link href="/api/auth/signout" className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                        Logout
                    </Link>
                </div>
            </div>
        </header>
    );
} 