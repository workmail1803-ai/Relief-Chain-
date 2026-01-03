/**
 * useDisasters Controller - Custom hook for disaster management logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as disasterModel from '../models/disasterModel';

export const useDisastersController = (initialPage = 0, perPage = 9) => {
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    const fetchDisasters = useCallback(async (pageNumber = 0) => {
        try {
            setLoading(true);
            const { data, error } = await disasterModel.fetchDisasters(pageNumber, perPage);

            if (error) throw error;

            if (data.length < perPage) {
                setHasMore(false);
            }

            if (pageNumber === 0) {
                setDisasters(data || []);
            } else {
                setDisasters(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error('Error fetching disasters:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [perPage]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDisasters(nextPage);
    }, [page, fetchDisasters]);

    useEffect(() => {
        fetchDisasters(0);

        const channel = disasterModel.subscribeToDisasters((payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            if (eventType === 'INSERT') {
                setDisasters(prev => [newRecord, ...prev]);
            } else if (eventType === 'UPDATE') {
                setDisasters(prev => prev.map(d => d.id === newRecord.id ? newRecord : d));
            } else if (eventType === 'DELETE') {
                setDisasters(prev => prev.filter(d => d.id !== oldRecord.id));
            }
        });

        return () => {
            disasterModel.removeChannel(channel);
        };
    }, [fetchDisasters]);

    return {
        disasters,
        loading,
        error,
        hasMore,
        loadMore,
        refetch: () => fetchDisasters(0)
    };
};

export const useDisasterDetail = (id) => {
    const [disaster, setDisaster] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDisaster = useCallback(async () => {
        const { data, error } = await disasterModel.fetchDisasterById(id);
        if (error) console.error(error);
        else setDisaster(data);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchDisaster();

        const channel = disasterModel.subscribeToDisaster(id, () => fetchDisaster());

        return () => {
            disasterModel.removeChannel(channel);
        };
    }, [id, fetchDisaster]);

    return { disaster, loading, setDisaster, refetch: fetchDisaster };
};

export default useDisastersController;
