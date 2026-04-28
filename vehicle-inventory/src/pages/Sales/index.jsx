import { useEffect, useState } from 'react'

const SALES_API = 'http://localhost:5047/api/Sales'
const PARTS_API = 'http://localhost:5047/api/Parts'

export default function Sales() {
    const [sales, setSales] = useState([])
    const [parts, setParts] = useState([])
    const [customerId, setCustomerId] = useState('')
    const [staffId, setStaffId] = useState('')
    const [items, setItems] = useState([{ partId: '', quantity: '' }])
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchSales()
        fetchParts()
    }, [])

    async function fetchSales() {
        const res = await fetch(SALES_API)
        const data = await res.json()
        setSales(data)
    }

    async function fetchParts() {
        const res = await fetch(PARTS_API)
        const data = await res.json()
        setParts(data)
    }

    function addItem() {
        setItems([...items, { partId: '', quantity: '' }])
    }

    function removeItem(index) {
        setItems(items.filter((_, i) => i !== index))
    }

    function updateItem(index, field, value) {
        const updated = [...items]
        updated[index][field] = value
        setItems(updated)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const body = {
            customerId: parseInt(customerId),
            staffId: parseInt(staffId),
            items: items.map(i => ({ partId: parseInt(i.partId), quantity: parseInt(i.quantity) }))
        }
        const res = await fetch(SALES_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (res.ok) {
            const sale = await res.json()
            setMessage(`Sale created! Total: ${sale.totalAmount} ${sale.loyaltyDiscountApplied ? '(10% loyalty discount applied!)' : ''}`)
            setCustomerId('')
            setStaffId('')
            setItems([{ partId: '', quantity: '' }])
            fetchSales()
        } else {
            const err = await res.text()
            setMessage(`Error: ${err}`)
        }
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Sales & Invoices</h1>
            {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2>Create Sale</h2>
                <input placeholder="Customer ID" type="number" value={customerId} onChange={e => setCustomerId(e.target.value)} required />
                <input placeholder="Staff ID" type="number" value={staffId} onChange={e => setStaffId(e.target.value)} required />

                <h3>Items</h3>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select value={item.partId} onChange={e => updateItem(index, 'partId', e.target.value)} required>
                            <option value="">Select Part</option>
                            {parts.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                        </select>
                        <input placeholder="Qty" type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required style={{ width: '60px' }} />
                        {items.length > 1 && <button type="button" onClick={() => removeItem(index)}>✕</button>}
                    </div>
                ))}
                <button type="button" onClick={addItem}>+ Add Item</button>
                <button type="submit">Create Sale</button>
            </form>

            <h2>Sales History</h2>
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>ID</th><th>Customer ID</th><th>Date</th><th>Subtotal</th><th>Discount</th><th>Total</th><th>Loyalty</th>
                </tr>
                </thead>
                <tbody>
                {sales.map(s => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.customerId}</td>
                        <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                        <td>{s.subTotal}</td>
                        <td>{s.discountAmount}</td>
                        <td>{s.totalAmount}</td>
                        <td>{s.loyaltyDiscountApplied ? '✅ 10% off' : '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}