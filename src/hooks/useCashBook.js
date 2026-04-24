// useCashBook — subscribes to cash book entries for the logged-in user
import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToCash,
  addCashEntry   as fbAdd,
  updateCashEntry as fbUpdate,
  deleteCashEntry as fbDelete,
} from '../firebase/cashService';

export function useCashBook(uid) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = subscribeToCash(uid, data => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const addEntry    = useCallback(e => fbAdd(uid, e),    [uid]);
  const updateEntry = useCallback(e => fbUpdate(uid, e), [uid]);
  const deleteEntry = useCallback(id => fbDelete(uid, id), [uid]);

  return { entries, loading, addEntry, updateEntry, deleteEntry };
}
