const API_BASE_URL = 'http://localhost:8080/api';

const createCrudMethods = (resource) => ({
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`);
      if (!response.ok) throw new Error(`Failed to fetch ${resource}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  delete: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/${resource}/${id}`, { method: 'DELETE' });
      return true;
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

