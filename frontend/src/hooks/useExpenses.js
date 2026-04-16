import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useExpenses(filters = {}) {
  const [expenses, setExpenses] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.month    && filters.month    !== 'All') params.month    = filters.month;

      const [expRes, sumRes] = await Promise.all([
        api.get('/expenses', { params }),
        api.get('/expenses/summary'),
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.month]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addExpense = async (payload) => {
    const { data } = await api.post('/expenses', payload);
    await fetchAll();
    return data;
  };

  const updateExpense = async (id, payload) => {
    const { data } = await api.put(`/expenses/${id}`, payload);
    await fetchAll();
    return data;
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    await fetchAll();
  };

  return { expenses, summary, loading, error, addExpense, updateExpense, deleteExpense, refetch: fetchAll };
}
