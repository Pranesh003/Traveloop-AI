import { db } from './mockDatabase';

const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (hasBody = false) => {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('tl_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const createCrudMethods = (resource) => ({
  getAll: async () => {
    let apiData = [];
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const resData = data.data ?? data;
        if (Array.isArray(resData)) {
          apiData = resData;
        }
      }
    } catch (error) {
      console.error(`Fetch error for ${resource}:`, error);
    }
    
    // Get mock DB data
    const mockData = db.getItems(resource);
    
    // Merge them: prioritize items with the same ID or name/city
    const merged = [...apiData];
    mockData.forEach(mockItem => {
      // Check if it's already in the API list (match by ID, or name/city)
      const exists = apiData.some(apiItem => 
        apiItem.id === mockItem.id || 
        (apiItem.name && apiItem.name.toLowerCase() === (mockItem.city || mockItem.name || '').toLowerCase()) ||
        (apiItem.city && typeof apiItem.city === 'object' && apiItem.city.name && apiItem.city.name.toLowerCase() === (mockItem.city || '').toLowerCase())
      );
      if (!exists) {
        merged.push(mockItem);
      }
    });
    
    return merged;
  },
  create: async (data) => {
    // Synchronize both mock DB and API
    const mockItem = db.addItem(resource, data);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const resData = await response.json();
        const created = resData.data ?? resData;
        // Keep IDs matched if backend assigned one
        if (created && created.id) {
          db.updateItem(resource, mockItem.id, created);
          return created;
        }
      }
    } catch (error) {
      console.error(`Create error for ${resource}:`, error);
    }
    return mockItem;
  },
  update: async (id, data) => {
    // Synchronize both mock DB and API
    const updatedMock = db.updateItem(resource, id, data);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const resData = await response.json();
        return resData.data ?? resData;
      }
    } catch (error) {
      console.error(`Update error for ${resource}:`, error);
    }
    return updatedMock;
  },
  delete: async (id) => {
    db.deleteItem(resource, id);
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error(`Delete error for ${resource}:`, error);
      return true; // Still return true as mock delete succeeded
    }
  }
});

export const apiService = {
  // --- USERS ---
  getUsers: async () => createCrudMethods('users').getAll(),
  createUser: async (user) => createCrudMethods('users').create(user),
  updateUser: async (id, user) => createCrudMethods('users').update(id, user),
  deleteUser: async (id) => createCrudMethods('users').delete(id),

  // --- DESTINATIONS ---
  ...createCrudMethods('destinations'),
  destinations: createCrudMethods('destinations'),

  // --- ACTIVITIES ---
  activities: createCrudMethods('activities'),

  // --- PACKAGES ---
  packages: createCrudMethods('packages'),

  // --- PLANS ---
  plans: createCrudMethods('plans'),

  // --- REPORTS ---
  reports: createCrudMethods('reports'),

  // --- TICKETS ---
  tickets: createCrudMethods('tickets'),

  // --- BROADCASTS ---
  broadcasts: createCrudMethods('broadcasts'),
};

