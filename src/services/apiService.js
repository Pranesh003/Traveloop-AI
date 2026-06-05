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
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`Failed to fetch ${resource}`);
      const data = await response.json();
      return data.data ?? data; // Extract standard API format
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
      if (!response.ok) return null;
      const resData = await response.json();
      return resData.data ?? resData;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });
      if (!response.ok) return null;
      const resData = await response.json();
      return resData.data ?? resData;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
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

