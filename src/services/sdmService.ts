import { SDM } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const sdmService = {
  // Get all SDM
  async getAllSDM(): Promise<SDM[]> {
    const response = await fetch(`${API_BASE_URL}/sdm`);
    if (!response.ok) {
      throw new Error('Failed to fetch SDM data');
    }
    return response.json();
  },

  // Create new SDM
  async createSDM(sdmData: Omit<SDM, 'id' | 'created_at' | 'updated_at'>): Promise<SDM> {
    const response = await fetch(`${API_BASE_URL}/sdm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sdmData),
    });
    if (!response.ok) {
      throw new Error('Failed to create SDM');
    }
    return response.json();
  },

  // Get SDM by ID
  async getSDMById(id: number): Promise<SDM> {
    const response = await fetch(`${API_BASE_URL}/sdm/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch SDM');
    }
    return response.json();
  },

  // Update SDM
  async updateSDM(id: number, sdmData: Partial<SDM>): Promise<SDM> {
    const response = await fetch(`${API_BASE_URL}/sdm/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sdmData),
    });
    if (!response.ok) {
      throw new Error('Failed to update SDM');
    }
    return response.json();
  },

  // Delete SDM
  async deleteSDM(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sdm/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete SDM');
    }
  },

  // Search SDM
  async searchSDM(term: string): Promise<SDM[]> {
    const response = await fetch(`${API_BASE_URL}/sdm/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      throw new Error('Failed to search SDM');
    }
    return response.json();
  },
}; 