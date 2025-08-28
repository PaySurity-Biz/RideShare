import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Clock, Car, MapPin } from 'lucide-react';

export function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedYear, setSelectedYear] = useState('2024');

  // Mock earnings data
  const earningsData = {
    today: {
      gross: 15420,
      net: 12336,
      trips: 12,
      hours: 8.5,
      commission: 3084,
    },
    week: {
      gross: 89750,
      net: 71800,
      trips: 67,
      hours: 42.5,
      commission: 17950,
    },
    month: {
      gross: 387500,
      net: 310000,
      trips: 289,
      hours: 185,
      commission: 77500,
    },
    year: {
      gross: 4650000,
      net: 3720000,
      trips: 3467,
      hours: 2220,
      commission: 930000,
    },
  };

  const recentTrips = [
    {
      id: 'trip_001',
      date: '2024-01-15',
      time: '14:30',
      pickup: 'Downtown Chicago',
      dropoff: 'O\'Hare Airport',
      distance: 18.5,
      duration: 35,
      fare: 4500,
      net: 3600,
      rating: 5,
    },
    {
      id: 'trip_002',
      date: '2024-01-15',
      time: '12:15',
      pickup: 'Lincoln Park',
      dropoff: 'Navy Pier',
      distance: 4.2,
      duration: 15,
      fare: 1800,
      net: 1440,
      rating: 5,
    },
    {
      id: 'trip_003',
      date: '2024-01-15',
      time: '10:45',
      pickup: 'River North',
      dropoff: 'Millennium Park',
      distance: 2.8,
      duration: 12,
      fare: 1500,
      net: 1200,
      rating: 4,
    },
  ];

  const monthlyData = [
    { month: 'Jan', earnings: 31000 },
    { month: 'Feb', earnings: 28500 },
    { month: 'Mar', earnings: 33200 },
    { month: 'Apr', earnings: 29800 },
    { month: 'May', earnings: 35600 },
    { month: 'Jun', earnings: 32400 },
    { month: 'Jul', earnings: 38900 },
    { month: 'Aug', earnings: 36200 },
    { month: 'Sep', earnings: 34800 },
    { month: 'Oct', earnings: 37500 },
    { month: 'Nov', earnings: 33900 },
    { month: 'Dec', earnings: 31000 },
  ];

  const currentData = earningsData[selectedPeriod];

  const formatCurrency = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentData.net)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              After {((currentData.commission / currentData.gross) * 100).toFixed(0)}% commission
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-blue-600">{currentData.trips}</p>
              </div>
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Avg: {formatCurrency(currentData.net / currentData.trips)} per trip
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Online Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatHours(currentData.hours)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {formatCurrency((currentData.net / currentData.hours) * 100)}/hour
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gross Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentData.gross)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Commission: {formatCurrency(currentData.commission)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Monthly Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-8">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(data.earnings / Math.max(...monthlyData.map(d => d.earnings))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {formatCurrency(data.earnings)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Trips</h3>
            
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{trip.date} at {trip.time}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="text-gray-700">{trip.pickup}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                          <span className="text-gray-700">{trip.dropoff}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(trip.net)}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{trip.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>{trip.distance} miles • {trip.duration} min</span>
                    <span>Gross: {formatCurrency(trip.fare)}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
              View All Trips
            </button>
          </div>
        </div>

        {/* Payout Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Next Payout</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-800">Weekly Payout</span>
                  <span className="font-semibold text-green-900">
                    {formatCurrency(currentData.net)}
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Scheduled for Monday, January 22, 2024
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payout Method</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bank Account</p>
                    <p className="text-sm text-gray-600">****1234</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}