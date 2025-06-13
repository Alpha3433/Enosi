import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, RotateCcw, Save, Wand2, Settings } from 'lucide-react';

function SeatingChart({ guests = [], onSave }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [unassignedGuests, setUnassignedGuests] = useState(guests);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [chartName, setChartName] = useState('Main Reception');
  const [venueLayout, setVenueLayout] = useState('ballroom');
  const canvasRef = useRef(null);

  useEffect(() => {
    setUnassignedGuests(guests);
  }, [guests]);

  const addTable = () => {
    const newTable = {
      id: Date.now(),
      table_number: tables.length + 1,
      table_shape: 'round',
      seat_count: 8,
      position_x: 200 + (tables.length % 3) * 150,
      position_y: 200 + Math.floor(tables.length / 3) * 150,
      guests: []
    };
    setTables([...tables, newTable]);
  };

  const updateTable = (tableId, updates) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, ...updates } : table
    ));
  };

  const removeTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.guests.length > 0) {
      // Move guests back to unassigned
      setUnassignedGuests(prev => [...prev, ...table.guests]);
    }
    setTables(prev => prev.filter(t => t.id !== tableId));
    setSelectedTable(null);
  };

  const handleGuestDrop = (tableId, guestId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || table.guests.length >= table.seat_count) return;

    // Remove guest from current location
    setTables(prev => prev.map(t => ({
      ...t,
      guests: t.guests.filter(g => g.id !== guestId)
    })));
    setUnassignedGuests(prev => prev.filter(g => g.id !== guestId));

    // Add guest to new table
    const guest = [...unassignedGuests, ...tables.flatMap(t => t.guests)]
      .find(g => g.id === guestId);
    
    if (guest) {
      updateTable(tableId, {
        guests: [...table.guests, guest]
      });
    }
  };

  const removeGuestFromTable = (tableId, guestId) => {
    const table = tables.find(t => t.id === tableId);
    const guest = table.guests.find(g => g.id === guestId);
    
    if (guest) {
      updateTable(tableId, {
        guests: table.guests.filter(g => g.id !== guestId)
      });
      setUnassignedGuests(prev => [...prev, guest]);
    }
  };

  const optimizeSeating = async () => {
    try {
      // Call AI optimization API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/planning/seating-charts/${chartName}/optimize`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTables(result.assignments);
        alert('Seating optimized successfully!');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Failed to optimize seating. Please try again.');
    }
  };

  const saveSeatingChart = async () => {
    try {
      const chartData = {
        layout_name: chartName,
        venue_layout: venueLayout,
        tables: tables,
        unassigned_guests: unassignedGuests.map(g => g.id)
      };

      await onSave(chartData);
      alert('Seating chart saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save seating chart. Please try again.');
    }
  };

  const Table = ({ table }) => {
    const isSelected = selectedTable?.id === table.id;
    const occupancyRate = (table.guests.length / table.seat_count) * 100;
    
    return (
      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={(event, info) => {
          updateTable(table.id, {
            position_x: table.position_x + info.offset.x,
            position_y: table.position_y + info.offset.y
          });
        }}
        whileHover={{ scale: 1.05 }}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-pink-500' : ''}`}
        style={{
          left: table.position_x,
          top: table.position_y,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => setSelectedTable(table)}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedGuest) {
            handleGuestDrop(table.id, draggedGuest.id);
            setDraggedGuest(null);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className={`
          w-20 h-20 rounded-full border-2 border-gray-300 bg-white shadow-md
          flex flex-col items-center justify-center text-xs font-medium
          ${table.table_shape === 'rectangular' ? 'rounded-lg' : 'rounded-full'}
          ${occupancyRate === 100 ? 'bg-green-100 border-green-300' : 
            occupancyRate > 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-white'}
        `}>
          <div className="text-gray-700 font-bold">T{table.table_number}</div>
          <div className="text-gray-500">{table.guests.length}/{table.seat_count}</div>
        </div>
        
        {/* Guest avatars around table */}
        {table.guests.map((guest, index) => {
          const angle = (index / table.seat_count) * 360;
          const radius = 35;
          const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
          const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
          
          return (
            <div
              key={guest.id}
              className="absolute w-6 h-6 bg-pink-500 rounded-full text-white text-xs flex items-center justify-center cursor-pointer hover:bg-pink-600"
              style={{
                left: x + 40,
                top: y + 40,
                transform: 'translate(-50%, -50%)'
              }}
              title={`${guest.first_name} ${guest.last_name}`}
              onClick={(e) => {
                e.stopPropagation();
                removeGuestFromTable(table.id, guest.id);
              }}
            >
              {guest.first_name.charAt(0)}
            </div>
          );
        })}
      </motion.div>
    );
  };

  const GuestItem = ({ guest, isUnassigned = true }) => (
    <div
      draggable={isUnassigned}
      onDragStart={() => setDraggedGuest(guest)}
      onDragEnd={() => setDraggedGuest(null)}
      className={`
        flex items-center p-2 bg-white border border-gray-200 rounded-md cursor-move
        hover:border-pink-300 hover:bg-pink-50 transition-colors
        ${draggedGuest?.id === guest.id ? 'opacity-50' : ''}
      `}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
        {guest.first_name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {guest.first_name} {guest.last_name}
        </p>
        {guest.relationship && (
          <p className="text-xs text-gray-500">{guest.relationship}</p>
        )}
      </div>
      {guest.plus_one && (
        <div className="text-xs text-gray-500">+1</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <input
              type="text"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              className="text-xl font-bold text-gray-900 border-none outline-none bg-transparent"
            />
            <p className="text-gray-600">Drag guests to tables to assign seating</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={optimizeSeating}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Optimize
            </button>
            <button
              onClick={saveSeatingChart}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <select
            value={venueLayout}
            onChange={(e) => setVenueLayout(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="ballroom">Ballroom</option>
            <option value="garden">Garden</option>
            <option value="beach">Beach</option>
            <option value="barn">Barn</option>
          </select>
          
          <button
            onClick={addTable}
            className="flex items-center px-3 py-2 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Table
          </button>
          
          <div className="text-sm text-gray-600">
            Tables: {tables.length} | Seated: {tables.reduce((sum, t) => sum + t.guests.length, 0)} | Unassigned: {unassignedGuests.length}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Chart Canvas */}
        <div className="flex-1 relative bg-gray-50 min-h-[600px]" ref={canvasRef}>
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Tables */}
          {tables.map(table => (
            <Table key={table.id} table={table} />
          ))}
          
          {/* Drop zone indicator */}
          {draggedGuest && (
            <div className="absolute inset-0 bg-pink-100 bg-opacity-50 border-2 border-dashed border-pink-300 flex items-center justify-center">
              <div className="text-pink-600 text-lg font-medium">
                Drop guest on a table to assign seating
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 p-6">
          {/* Table Details */}
          {selectedTable && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                Table {selectedTable.table_number} Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Seats</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={selectedTable.seat_count}
                    onChange={(e) => updateTable(selectedTable.id, { seat_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shape</label>
                  <select
                    value={selectedTable.table_shape}
                    onChange={(e) => updateTable(selectedTable.id, { table_shape: e.target.value })}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="round">Round</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>
                <button
                  onClick={() => removeTable(selectedTable.id)}
                  className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove Table
                </button>
              </div>
            </div>
          )}

          {/* Unassigned Guests */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Unassigned Guests ({unassignedGuests.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unassignedGuests.map(guest => (
                <GuestItem key={guest.id} guest={guest} />
              ))}
              {unassignedGuests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  All guests have been seated!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatingChart;