import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import type { List } from '../lib/types';

export default function ManageLists({ user, lists, setLists, activeList, setActiveList }: { user: User | null, lists: List[], setLists: React.Dispatch<React.SetStateAction<List[]>>, activeList: string, setActiveList: (list: string) => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!user) {
        return <div className="text-center py-20">Please log in to manage your lists.</div>;
    }

    const startEditing = (list: List) => {
        setEditingId(list.id);
        setEditName(list.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleRename = async (id: string) => {
        if (!editName.trim()) return;
        if (lists.some(l => l.name === editName && l.id !== id)) {
            alert('A list with this name already exists.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('lists')
                .update({ name: editName })
                .eq('id', id);

            if (error) throw error;

            setLists(prev => prev.map(l => l.id === id ? { ...l, name: editName } : l));
            setEditingId(null);
        } catch (error: unknown) {
            alert('Error renaming list: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (list: List) => {
        if (lists.length <= 1) {
            alert('You must have at least one list.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete the list "${list.name}"? All cards in this list will also be deleted.`)) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('lists')
                .delete()
                .eq('id', list.id);

            if (error) throw error;

            const updatedLists = lists.filter(l => l.id !== list.id);
            setLists(updatedLists);

            // If we deleted the active list, switch to another one
            if (activeList === list.name) setActiveList(updatedLists[0].name);
        } catch (error: unknown) {
            alert('Error deleting list: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Lists</h1>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                    Back to Collection
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <ul className="divide-y divide-gray-100">
                    {lists.map(list => (
                        <li key={list.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            {editingId === list.id ? (
                                <div className="flex items-center space-x-2 flex-grow mr-4">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleRename(list.id)}
                                        disabled={loading}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-lg font-medium text-gray-700">{list.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => startEditing(list)}
                                            className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Rename
                                        </button>
                                        <button
                                            onClick={() => handleDelete(list)}
                                            className="px-4 py-2 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <p className="mt-4 text-sm text-gray-500 italic">
                Note: Deleting a list will also delete all Pokémon cards assigned to that list.
            </p>
        </div>
    );
}
