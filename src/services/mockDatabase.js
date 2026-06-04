import { ROLES } from '../constants/permissions';

const initialData = {
  users: [
    { id: 1, name: 'Super Admin', email: 'superadmin@traveloop.com', role: ROLES.SUPER_ADMIN, createdAt: new Date().toISOString(), status: 'active' },
    { id: 2, name: 'Admin', email: 'admin@traveloop.com', role: ROLES.ADMIN, createdAt: new Date().toISOString(), status: 'active' },
    { id: 3, name: 'User', email: 'demo@traveloop.com', role: ROLES.USER, createdAt: new Date().toISOString(), status: 'active' }
  ],
  destinations: [
    { id: 1, country: 'Japan', city: 'Tokyo', status: 'Active', safety: 'High' },
    { id: 2, country: 'France', city: 'Paris', status: 'Active', safety: 'Medium' },
    { id: 3, country: 'Indonesia', city: 'Bali', status: 'Active', safety: 'High' },
    { id: 4, country: 'USA', city: 'New York', status: 'Active', safety: 'Medium' }
  ],
  activities: [
    { id: 1, name: 'Mount Fuji Trek', type: 'Adventure', price: '₹4,500', duration: '8 Hours' },
    { id: 2, name: 'Louvre Museum Tour', type: 'Cultural', price: '₹2,200', duration: '3 Hours' },
    { id: 3, name: 'Scuba Diving', type: 'Water Sports', price: '₹6,000', duration: '4 Hours' },
    { id: 4, name: 'Sushi Making Class', type: 'Culinary', price: '₹3,500', duration: '2 Hours' }
  ],
  packages: [
    { id: 1, name: 'Japan Anime Tour', duration: '7 Days', price: '₹45,000', bookings: 124, rating: 4.8 },
    { id: 2, name: 'Europe Backpacking', duration: '14 Days', price: '₹120,000', bookings: 89, rating: 4.6 },
    { id: 3, name: 'Luxury Dubai Experience', duration: '5 Days', price: '₹85,000', bookings: 245, rating: 4.9 }
  ],
  reports: [
    { id: 1, type: 'Comment', user: 'john_doe', reason: 'Spam', date: '2 hours ago', status: 'Pending' },
    { id: 2, type: 'Review', user: 'travel_junkie', reason: 'Inappropriate Content', date: '5 hours ago', status: 'Pending' },
    { id: 3, type: 'Shared Trip', user: 'mike99', reason: 'Self Promotion', date: '1 day ago', status: 'Resolved' }
  ],
  plans: [
    { id: 1, name: 'Free', price: '₹0', users: '12,450', features: ['Basic AI Planner', '3 Trips/month', 'Public Itineraries'] },
    { id: 2, name: 'Premium', price: '₹499/mo', users: '3,210', features: ['Advanced AI Models', 'Unlimited Trips', 'Offline Access', 'Collab Mode'], popular: true },
    { id: 3, name: 'Enterprise', price: 'Custom', users: '45', features: ['API Access', 'Dedicated Account Manager', 'White Labeling', 'Advanced Analytics'] }
  ],
  tickets: [
    { id: '#T-1042', user: 'jane_smith', subject: 'Billing Issue - Charged Twice', status: 'Open', priority: 'High', time: '2h ago' },
    { id: '#T-1041', user: 'mike_travel', subject: 'How do I export itinerary?', status: 'In Progress', priority: 'Low', time: '5h ago' },
    { id: '#T-1040', user: 'demo_user', subject: 'AI Planner crashed', status: 'Resolved', priority: 'Medium', time: '1d ago' }
  ],
  broadcasts: [
    { id: 1, title: 'System Update V2.0', body: 'We are rolling out the new AI Planner update...', target: 'All Users', channels: ['In-App', 'Email'], date: '2d ago' },
    { id: 2, title: 'Premium Discount', body: 'Upgrade to Premium today for 20% off...', target: 'Free Users', channels: ['Email'], date: '1w ago' }
  ]
};

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    // Initialize or migrate users
    if (!localStorage.getItem('tl_db_users')) {
      localStorage.setItem('tl_db_users', JSON.stringify(initialData.users));
    } else {
      let users = JSON.parse(localStorage.getItem('tl_db_users'));
      let modified = false;
      users = users.map(u => {
        if (u.role === 'content_manager' || u.role === 'travel_expert') {
          modified = true;
          return { ...u, role: ROLES.ADMIN };
        }
        if (u.role === 'free_user' || u.role === 'premium_user') {
          modified = true;
          return { ...u, role: ROLES.USER };
        }
        return u;
      });
      if (modified) {
        localStorage.setItem('tl_db_users', JSON.stringify(users));
      }
    }

    // Initialize other collections
    const collections = ['destinations', 'activities', 'packages', 'reports', 'plans', 'tickets', 'broadcasts'];
    collections.forEach(col => {
      if (!localStorage.getItem(`tl_db_${col}`)) {
        localStorage.setItem(`tl_db_${col}`, JSON.stringify(initialData[col]));
      }
    });
  }

  // Generic Collection Methods
  _get(collection) {
    return JSON.parse(localStorage.getItem(`tl_db_${collection}`) || '[]');
  }

  _set(collection, data) {
    localStorage.setItem(`tl_db_${collection}`, JSON.stringify(data));
  }

  // Items
  getItems(collection) {
    return this._get(collection);
  }

  addItem(collection, itemData) {
    const items = this._get(collection);
    const newItem = { id: typeof itemData.id !== 'undefined' ? itemData.id : Date.now(), ...itemData };
    items.unshift(newItem); // Add to beginning
    this._set(collection, items);
    return newItem;
  }

  updateItem(collection, id, updates) {
    let items = this._get(collection);
    items = items.map(i => (i.id === id ? { ...i, ...updates } : i));
    this._set(collection, items);
    return items.find(i => i.id === id);
  }

  deleteItem(collection, id) {
    let items = this._get(collection);
    items = items.filter(i => i.id !== id);
    this._set(collection, items);
  }

  // Legacy user methods wrapping the generic ones
  getUsers() { return this.getItems('users'); }
  getUserByEmail(email) { return this.getItems('users').find(u => u.email === email); }
  updateUser(id, updates) { return this.updateItem('users', id, updates); }
  deleteUser(id) { this.deleteItem('users', id); }
  addUser(userData) { return this.addItem('users', userData); }
}

export const db = new MockDatabase();
