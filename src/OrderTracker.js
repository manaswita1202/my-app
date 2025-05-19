import React, { useState } from 'react';
import './OrderTracker.css';
import { useEffect } from 'react';
const GARMENT_TYPES = ['Shirts', 'T-Shirts', 'Shorts', 'Trousers'];
const ORDER_PROGRESS = ['Booked Portal', 'Sent from Factory', 'In Transit', 'Received'];

function OrderTracker() {
  const [couriers, setCouriers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newCourier, setNewCourier] = useState({
    styleNumber: '',
    courierName: '',
    awbNumber: '',
    att: '',
    content: '',
    garmentType: '',
  });

  useEffect(() => {
    fetch("https://samplify-backend-production.up.railway.app/get_couriers")
      .then(response => response.json())
      .then(data => setCouriers(data))
      .catch(error => console.error("Error fetching couriers:", error));
  }, []);

  const addNewCourier = () => {
    if (!newCourier.styleNumber || !newCourier.courierName || !newCourier.awbNumber || !newCourier.att || !newCourier.content || !newCourier.garmentType) {
      alert('Please fill all fields');
      return;
    }

    const courier = {
      ...newCourier,
      id: Date.now(),
      placement: new Date(),
      orders: ORDER_PROGRESS.map(type => ({
        type,
        completed: false,
        placement: null,
        date: null
      })),
      date: null
    };
    fetch("https://samplify-backend-production.up.railway.app/add_courier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courier)
    })
      .then(response => response.json())
      .then(data => {
        setCouriers([...couriers, data]);
        setNewCourier({ styleNumber: '', courierName: '', awbNumber: '', att: '', content: '', garmentType: '' });
        setShowDialog(false);
      })
      .catch(error => console.error("Error adding courier:", error));

    setCouriers([...couriers, courier]);
    setNewCourier({ styleNumber: '', courierName: '', awbNumber: '', att: '', content: '', garmentType: '' });
    
    setShowDialog(false);
  };

  // const toggleOrder = (courierId, orderIndex) => {
  //   setCouriers(prevCouriers =>
  //     prevCouriers.map(courier => {
  //       if (courier.id !== courierId) return courier;

  //       const newOrders = [...courier.orders];
  //       newOrders[orderIndex] = {
  //         ...newOrders[orderIndex],
  //         completed: !newOrders[orderIndex].completed,
  //         placement: newOrders[orderIndex].placement || new Date(),
  //         date: !newOrders[orderIndex].completed ? new Date() : null
  //       };
  //       fetch(`https://samplify-backend-production.up.railway.app/update_order/${courierId}`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ orders: newOrders })
  //       })
  //         .then(response => response.json())
  //         .catch(error => console.error("Error updating order status:", error));
  
  //       const allCompleted = newOrders.every(order => order.completed);
  //       return {
  //         ...courier,
  //         date: allCompleted ? new Date() : null,
  //         orders: newOrders
  //       };
  //     })
  //   );
  // };


  const toggleOrder = (courierId, orderIndex) => {
    setCouriers(prevCouriers =>
      prevCouriers.map(courier => {
        if (courier.id !== courierId) return courier;
  
        const newOrders = [...courier.orders];
        const order = newOrders[orderIndex];
  
        const updatedOrder = {
          orderId: order.id,  // Make sure `id` is present
          completed: !order.completed
        };
  
        // Send API request
        fetch("https://samplify-backend-production.up.railway.app/update_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOrder),
        })
          .then(response => response.json())
          .then(data => {
            console.log("Order updated:", data);
            newOrders[orderIndex] = {
              ...order,
              completed: data.completed,
              date: data.completionDate ? new Date(data.completionDate) : null
            };
  
            const allCompleted = newOrders.every(order => order.completed);
            setCouriers(prev => prev.map(c =>
              c.id === courierId ? { ...c, orders: newOrders, date: allCompleted ? new Date() : null } : c
            ));
          })
          .catch(error => console.error("Error updating order status:", error));
  
        return courier;
      })
    );
  };
  
  const getProgressWidth = (orders) => {
    if (!orders.length) return '0%';
    const completedCount = orders.filter(order => order.completed).length;
    return `${(completedCount / orders.length) * 100}%`;
  };

  const deleteCourier = (courierId) => {
    if (window.confirm('Are you sure you want to delete this courier?')) {
      fetch(`https://samplify-backend-production.up.railway.app/delete_courier/${courierId}`, { method: "DELETE" })
        .then(() => setCouriers(couriers.filter(courier => courier.id !== courierId)))
        .catch(error => console.error("Error deleting courier:", error));
    }
  };

  const calculateDays = (placement, date) => {
    if (!placement || !date) return 0;
    const diff = new Date(date) - new Date(placement);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="order-tracker">
      <h1>Order Tracking Dashboard</h1>

      <button className="add-button" onClick={() => setShowDialog(true)}>
        Add New Courier
      </button>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Add New Style</h2>
            <input
              type="text"
              placeholder="Style Number"
              value={newCourier.styleNumber}
              onChange={(e) => setNewCourier({ ...newCourier, styleNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="Courier Name"
              value={newCourier.courierName}
              onChange={(e) => setNewCourier({ ...newCourier, courierName: e.target.value })}
            />
            <input
              type="text"
              placeholder="AWB Number"
              value={newCourier.awbNumber}
              onChange={(e) => setNewCourier({ ...newCourier, awbNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="ATT"
              value={newCourier.att}
              onChange={(e) => setNewCourier({ ...newCourier, att: e.target.value })}
            />
            <input
              type="text"
              placeholder="Content"
              value={newCourier.content}
              onChange={(e) => setNewCourier({ ...newCourier, content: e.target.value })}
            />
            <select
              value={newCourier.garmentType}
              onChange={(e) => setNewCourier({ ...newCourier, garmentType: e.target.value })}
            >
              <option value="">Select Garment Type</option>
              {GARMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="dialog-buttons">
              <button onClick={addNewCourier}>Add</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="courier-container">
        {couriers.map(courier => (
          <div key={courier.id} className="courier-card">
            <div className="courier-header">
              <div className="courier-info">
                <h2>
                  Style Number: {courier.styleNumber} <br />
                  Courier Name: {courier.courierName} <br />
                  AWB Number: {courier.awbNumber}
                  ATT: {courier.att} <br />
                  Content: {courier.content} <br />
                  Grment: {courier.garmentType}
                  </h2>
              </div>
              <div className="courier-dates">
                <p>Placement: {courier.placement}</p>
                {courier.date && (
                  <>
                    <p>Date: {courier.date.toLocaleDateString()}</p>
                    <p>Total Days: {calculateDays(courier.placement, courier.date)}</p>
                  </>
                )}
                <button className={`status-button ${courier.date ? 'completed' : 'progress'}`}>
                  {courier.date ? "Completed" : "In Progress"}
                </button>
                <button className="delete-button" onClick={() => deleteCourier(courier.id)}>
                  Delete
                </button>
              </div>
            </div>

            <div className="order-timeline">
              <div className="timeline-line"></div>
              <div className="timeline-progress" style={{ width: getProgressWidth(courier.orders) }}></div>
              <div className="timeline-points">
                {courier.orders.map((order, index) => (
                  <div key={order.type} className="order-point">
                    <button
                      className={`checkpoint ${order.completed ? 'completed' : ''}`}
                      onClick={() => toggleOrder(courier.id, index)}
                    ></button>
                    <p className="order-label">{order.type}</p>
                    {order.completed && (
                      <p className="order-days">
                        {calculateDays(order.placement, order.date)} days
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderTracker;
