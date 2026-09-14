import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useLive } from '../context/LiveContext';
export function useApiData(path, params, initialData = null) {
  const { revision } = useLive();
  const initialRef = useRef(initialData);
  const paramsKey = JSON.stringify(params || {});
  const [state, setState] = useState({ status: path ? 'loading' : 'idle', data: initialRef.current, error: '' });
  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, status: s.data == null ? 'loading' : s.status, error: '' }));
    try { const data = await api.get(path, JSON.parse(paramsKey)); setState({ status: 'success', data: data ?? initialRef.current, error: '' }); }
    catch (err) { setState({ status: 'error', data: initialRef.current, error: err?.message || 'Failed to load.' }); }
  }, [path, paramsKey]);
  useEffect(() => { if (path) load(); }, [path, load, revision]);
  return { ...state, retry: load };
}
