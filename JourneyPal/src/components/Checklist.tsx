import React, { useState } from 'react';
import '../Warning.css';

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
            <div className="popup-container">
                <div className="popup alert-popup">
                    <div className="popup-icon alert-icon">
                        <svg
                            className="alert-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </div>
                    <div className="alert-message">This feature has not yet been implemented.</div>
                    <div className="popup-icon close-icon">
                    </div>
                </div>
            </div>
            <h2 className='trip-checklist'>Trip Checklist</h2>
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