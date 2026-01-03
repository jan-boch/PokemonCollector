import AddCardForm from '../components/AddCardForm';


export default function AddPage({ user }: any) {
    if (!user) return <p>Please log in first</p>;

    return (
        <div style={{ maxWidth: 700 }}>
            <h2>Add new card</h2>
            <p>Logged in as {user.email}</p>
            <AddCardForm />
        </div>
    );
}