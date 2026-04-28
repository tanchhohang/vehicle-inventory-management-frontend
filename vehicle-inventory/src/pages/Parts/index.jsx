import { useEffect, useState } from 'react'

const API = 'http://localhost:5047/api/Parts'

export default function Parts() {
    const [parts, setParts] = useState([])
    const [form, setForm] = useState({ name: '', description: '', category: '', price: '', stockQuantity: '' })
    const [editId, setEditId] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => { fetchParts() }, [])

    async function fetchParts() {
        const res = await fetch(API)
        const data = await res.json()
        setParts(data)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const body = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) }
        if (editId) {
            await fetch(`${API}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            setMessage('Part updated!')
        } else {
            await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            setMessage('Part added!')
        }
        setForm({ name: '', description: '', category: '', price: '', stockQuantity: '' })
        setEditId(null)
        fetchParts()
    }

    async function handleDelete(id) {
        await fetch(`${API}/${id}`, { method: 'DELETE' })
        setMessage('Part deleted!')
        fetchParts()
    }

    function handleEdit(part) {
        setEditId(part.id)
        setForm({ name: part.name, description: part.description || '', category: part.category || '', price: part.price, stockQuantity: part.stockQuantity })
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Parts Management</h1>
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
                <h2>{editId ? 'Edit Part' : 'Add Part'}</h2>
                <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input placeholder="Stock Quantity" type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} required />
                <button type="submit">{editId ? 'Update Part' : 'Add Part'}</button>
                {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', category: '', price: '', stockQuantity: '' }) }}>Cancel</button>}
            </form>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {parts.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td>{p.price}</td>
                        <td>{p.stockQuantity}</td>
                        <td>
                            <button onClick={() => handleEdit(p)}>Edit</button>
                            <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}