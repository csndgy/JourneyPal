import React, { useState } from 'react';

const Checklist: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState<string>('');
    const [packedItems, setPackedItems] = useState<{ [key: string]: boolean }>({});

    const addItem = () => {
        if (newItem.trim() !== '') {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const togglePacked = (item: string) => {
        setPackedItems((prev) => ({
            ...prev,
            [item]: !prev[item],
        }));
    };

    const removeItem = (item: string) => {
        setItems(items.filter((i) => i !== item));
        setPackedItems((prev) => {
            const updated = { ...prev };
            delete updated[item];
            return updated;
        });
    };

    return (
        <div className="checklist">
            <h2>Trip Checklist</h2>
            <div className="add-item">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add an item..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
                <button onClick={addItem}>Add</button>
            </div>
            <ul className="items-list">
                {items.map((item, index) => (
                    <li key={index} className={`item ${packedItems[item] ? 'packed' : ''}`}>
                        <span onClick={() => togglePacked(item)}>
                            {packedItems[item] ? '✔️' : '⬜'}{' '}
                            <span className="item-text">{item}</span>
                        </span>
                        <button onClick={() => removeItem(item)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Checklist;