import React, { useState } from 'react';
import './App.css';




function App() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Classic Coffeebara Cold Brew',
      size: 'Medium',
      price: 100,
      quantity: 1,
      image: '/kape.png'
    },
    {
      id: 2,
      name: 'Matchabara Cold Brew',
      size: 'Large',
      price: 100,
      quantity: 1,
      image: '/matcha.png'
    },
    {
      id: 3,
      name: 'Matchabara Frappe',
      size: 'Medium',
      price: 100,
      quantity: 1,
      image: '/frap.png'
    }
  ]);


  const updateQuantity = (id, change) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };


  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };


  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


  return (
    <div className="container-fluid p-4">
<div className="bg-white d-flex align-items-start pt-3 pb-2">
  <button
  className="btn btn-sm text-dark p-0 fs-5 opacity-75"
  style={{ fontWeight: '500' }}
  onClick={() => window.history.back()}
>
  ←
</button>
 
  <div className="ms-3">
    <h1 className="display-6 fw-bold mb-1">KAPE CART</h1>
    <p className="text-muted mb-0">All your picks in one spot.</p>
  </div>
</div>
      <div
        className="card shadow-sm border-0 mt-3"
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <div className="card-body">
          {cartItems.map(item => (
            <div key={item.id} className="d-flex py-3 border-bottom">
              <img
                src={item.image}
                alt=""
                className="me-3 rounded"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />


              <div className="flex-grow-1">
                <h5 className="mb-1">{item.name}</h5>
                <small className="text-muted">{item.size}</small>
              </div>


              <div className="text-end">
                <div className="fw-bold mb-1">₱{item.price}</div>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <span className="me-1">Qty:</span>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      –
                    </button>
                    <span className="btn btn-outline-secondary px-2">{item.quantity}</span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-link p-0 mt-1 fs-6 text-decoration-none"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="card shadow-sm border-0 mt-3" style={{ position: 'sticky', bottom: '70px', zIndex: 999 }}>
        <div className="card-footer bg-white">
          <div className="border-top pt-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Payment Details</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Estimated Total:</strong>
              <strong>₱{total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>




      <div className="position-fixed bottom-0 start-0 end-0 p-3 bg-white shadow-sm" style={{ zIndex: 1000 }}>
        <button className="btn btn-dark w-100 py-3 fs-5">
          Place Order
        </button>
      </div>
    </div>
  );
}


export default App;
