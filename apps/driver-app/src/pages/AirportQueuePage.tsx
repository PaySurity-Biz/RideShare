import React, { useState, useEffect } from 'react';
import { Plane, MapPin, Clock, Users, AlertCircle, Navigation } from 'lucide-react';

export function AirportQueuePage() {
  const [selectedAirport, setSelectedAirport] = useState('ORD');
  const [queueStatus, setQueueStatus] = useState('not_in_queue'); // not_in_queue, in_queue, staging
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  // Mock airport data
  const airportData = {
    ORD: {
      name: "O'Hare International Airport",
      totalInQueue: 42,
      averageWait: 35,
      upcomingFlights: [
        { flight: 'AA123', arrival: '14:30', terminal: '1', passengers: 180 },
        { flight: 'UA456', arrival: '14:45', terminal: '2', passengers: 220 },
        { flight: 'DL789', arrival: '15:00', terminal: '3', passengers: 165 },
      ],
      terminals: ['1', '2', '3', '5'],
      stagingLot: {
        capacity: 200,
        current: 42,
        address: 'Bessie Coleman Drive, Chicago, IL',
      }
    },
    MDW: {
      name: 'Chicago Midway International Airport',
      totalInQueue: 18,
      averageWait: 22,
      upcomingFlights: [
        { flight: 'WN234', arrival: '14:20', terminal: 'A', passengers: 140 },
        { flight: 'WN567', arrival: '14:55', terminal: 'B', passengers: 135 },
      ],
      terminals: ['A', 'B', 'C'],
      stagingLot: {
        capacity: 100,
        current: 18,
        address: 'Cicero Avenue, Chicago, IL',
      }
    }
  };

  const currentAirport = airportData[selectedAirport];

  useEffect(() => {
    // Simulate queue updates
    if (queueStatus === 'in_queue') {
      const interval = setInterval(() => {
        setQueuePosition(prev => Math.max(1, prev - Math.random() * 2));
        setEstimatedWait(prev => Math.max(5, prev - 1));
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [queueStatus]);

  const joinQueue = () => {
    setQueueStatus('staging');
    // Simulate joining queue
    setTimeout(() => {
      setQueueStatus('in_queue');
      setQueuePosition(currentAirport.totalInQueue + 1);
      setEstimatedWait(currentAirport.averageWait);
    }, 2000);
  };

  const leaveQueue = () => {
    setQueueStatus('not_in_queue');
    setQueuePosition(0);
    setEstimatedWait(0);
  };

  const renderQueueStatus = () => {
    switch (queueStatus) {
      case 'not_in_queue':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Airport Queue</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Plane className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">
                  {currentAirport.name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Drivers in Queue:</span>
                  <span className="font-semibold ml-2">{currentAirport.totalInQueue}</span>
                </div>
                <div>
                  <span className="text-blue-700">Average Wait:</span>
                  <span className="font-semibold ml-2">{currentAirport.averageWait} min</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Staging Lot Information</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Capacity</span>
                  <span className="font-medium">
                    {currentAirport.stagingLot.current} / {currentAirport.stagingLot.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(currentAirport.stagingLot.current / currentAirport.stagingLot.capacity) * 100}%`
                    }}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{currentAirport.stagingLot.address}</span>
                </div>
              </div>
            </div>

            <button
              onClick={joinQueue}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Join {selectedAirport} Queue
            </button>
          </div>
        );

      case 'staging':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Entering Staging Lot
              </h3>
              <p className="text-gray-600">
                Please proceed to the {selectedAirport} staging lot and wait for queue assignment
              </p>
            </div>
          </div>
        );

      case 'in_queue':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                In {selectedAirport} Queue
              </h3>
              <button
                onClick={leaveQueue}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Leave Queue
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium">Queue Position</p>
                    <p className="text-2xl font-bold text-green-900">
                      #{Math.floor(queuePosition)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium">Estimated Wait</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {Math.floor(estimatedWait)} min
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-medium">Queue Rules</p>
                  <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                    <li>• Stay in your vehicle in the staging lot</li>
                    <li>• Move to pickup zone when notified</li>
                    <li>• 15-minute grace period for passenger pickup</li>
                    <li>• Leaving queue will reset your position</li>
                  </ul>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
              Get Directions to Pickup Zone
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Airport Queue</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ORD">O'Hare (ORD)</option>
              <option value="MDW">Midway (MDW)</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Queue Status */}
          <div>
            {renderQueueStatus()}
          </div>

          {/* Flight Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Arrivals
            </h3>
            
            <div className="space-y-4">
              {currentAirport.upcomingFlights.map((flight, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{flight.flight}</p>
                      <p className="text-sm text-gray-600">
                        Terminal {flight.terminal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">{flight.arrival}</p>
                      <p className="text-sm text-gray-600">
                        {flight.passengers} passengers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Plane className="w-4 h-4 mr-1" />
                    <span>Estimated demand: High</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Terminal Coverage</h4>
              <div className="flex flex-wrap gap-2">
                {currentAirport.terminals.map((terminal) => (
                  <span
                    key={terminal}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    Terminal {terminal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Queue Performance Today
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">127</p>
              <p className="text-sm text-gray-600">Total Rides</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">28 min</p>
              <p className="text-sm text-gray-600">Avg Wait Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">$52.30</p>
              <p className="text-sm text-gray-600">Avg Fare</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">94%</p>
              <p className="text-sm text-gray-600">Match Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}