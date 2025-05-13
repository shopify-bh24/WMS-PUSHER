import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface HeaderProps {
    showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = true }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    // const { unreadCount } = useNotifications();
    const { data: session } = useSession();

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-indigo-600">WMS-PUSHER</h1>
                </div>
                <div className="flex items-center space-x-4 gap-[15px]">
                    {session && (
                        <div className="flex relative justify-center items-center">
                            <p
                                className='text-gray-600 hover:text-gray-900 cursor-pointer'
                                onClick={toggleNotifications}
                            >
                                News
                            </p>
                            {/* {unreadCount > 0 && ( */}
                            <div className="flex justify-center items-center text-white text-[10px] absolute w-5 h-5 bg-red-500 rounded-full -top-2 -right-4">
                                2
                            </div>
                            {/* )} */}
                        </div>
                    )}
                    {showDashboardLink && (
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                            Dashboard
                        </Link>
                    )}
                    {session ? (
                        <Link href="/api/auth/signout" className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                            Logout
                        </Link>
                    ) : (
                        <Link href="/login" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}