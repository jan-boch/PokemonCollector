import AddCardForm from '../components/AddCardForm';

export default function AddPage({ user, lists, activeList }: { user: any, lists: any[], activeList: string }) {
    if (!user) return <p className="text-center text-gray-500">Please log in first</p>;

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add new card</h2>
            <p className="text-gray-600 mb-4">Logged in as {user.email}</p>
            <AddCardForm user={user} lists={lists} activeList={activeList} />
        </div>
    );
}