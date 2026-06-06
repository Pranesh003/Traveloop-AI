import { db } from './mockDatabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE}/api` : 'http://localhost:5000/api';

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
      if (response.status === 401) {
        localStorage.removeItem('tl_token');
        localStorage.removeItem('tl_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (response.ok) {
        const data = await response.json();
        const resData = data.data ?? data;
        return Array.isArray(resData) ? resData : [];
      }
      throw new Error(`API error: ${response.status}`);
    } catch (error) {
      console.error(`Fetch error for ${resource}:`, error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        headers: getHeaders()
      });
      if (response.status === 401) {
        localStorage.removeItem('tl_token');
        localStorage.removeItem('tl_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (response.ok) {
        const data = await response.json();
        return data.data ?? data;
      }
      throw new Error(`API error: ${response.status}`);
    } catch (error) {
      console.error(`Fetch error for ${resource} id ${id}:`, error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
      if (response.status === 401) {
        localStorage.removeItem('tl_token');
        localStorage.removeItem('tl_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (response.ok) {
        const resData = await response.json();
        return resData.data ?? resData;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (error) {
      console.error(`Create error for ${resource}:`, error);
      throw error;
    }
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
      if (response.status === 401) {
        localStorage.removeItem('tl_token');
        localStorage.removeItem('tl_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
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

  // --- TRIPS ---
  trips: createCrudMethods('trips'),

  // --- ACTIVITIES ---
  activities: createCrudMethods('activities'),

  // --- PACKAGES ---
  packages: createCrudMethods('packages'),

  // --- PLANS ---
  plans: createCrudMethods('plans'),

  // --- REPORTS ---
  reports: createCrudMethods('community/reports'),

  // --- TICKETS ---
  tickets: createCrudMethods('tickets'),

  // --- BROADCASTS ---
  broadcasts: createCrudMethods('broadcasts'),

  // --- ANALYTICS ---
  analytics: {
    getOverview: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
          headers: getHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          return data.data ?? data;
        }
        throw new Error(`API error: ${response.status}`);
      } catch (error) {
        console.error('Fetch error for analytics overview:', error);
        return null;
      }
    },
    getRevenue: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/revenue`, {
          headers: getHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          return data.data ?? data;
        }
        throw new Error(`API error: ${response.status}`);
      } catch (error) {
        console.error('Fetch error for analytics revenue:', error);
        return null;
      }
    },
    getAiOverview: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/ai`, {
          headers: getHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          return data.data ?? data;
        }
        throw new Error(`API error: ${response.status}`);
      } catch (error) {
        console.error('Fetch error for AI analytics overview:', error);
        return null;
      }
    }
  }
};

