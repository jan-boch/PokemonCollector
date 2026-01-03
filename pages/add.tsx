import AddCardForm from '../components/AddCardForm';
import { useRouter } from 'next/router';

export default function AddPage({ user, lists, activeList }: { user: any, lists: { id: string, name: string }[], activeList: string }) {
    const router = useRouter();
    if (!user) return <p className="text-center text-gray-500 mt-10">Please log in first</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Add new card</h2>
                    <p className="text-sm text-gray-500">Logged in as {user.email}</p>
                </div>
                <button 
                    onClick={() => router.push('/')}
                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                >
                    Back to Collection
                </button>
            </div>
            <AddCardForm user={user} lists={lists} activeList={activeList} />
        </div>
    );
}