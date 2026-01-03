/**
 * useMedical Controller - Custom hook for medical cases management logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as medicalModel from '../models/medicalModel';

export const useMedicalController = (initialPage = 0, perPage = 9) => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    const fetchCases = useCallback(async (pageNumber = 0) => {
        try {
            setLoading(true);
            const { data, error } = await medicalModel.fetchMedicalCases(pageNumber, perPage);

            if (error) throw error;

            if (data.length < perPage) {
                setHasMore(false);
            }

            if (pageNumber === 0) {
                setCases(data || []);
            } else {
                setCases(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error('Error fetching medical cases:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [perPage]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCases(nextPage);
    }, [page, fetchCases]);

    useEffect(() => {
        fetchCases(0);

        const channel = medicalModel.subscribeToMedicalCases((payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            if (eventType === 'INSERT') {
                setCases(prev => [newRecord, ...prev]);
            } else if (eventType === 'UPDATE') {
                setCases(prev => prev.map(c => c.id === newRecord.id ? newRecord : c));
            } else if (eventType === 'DELETE') {
                setCases(prev => prev.filter(c => c.id !== oldRecord.id));
            }
        });

        return () => {
            medicalModel.removeChannel(channel);
        };
    }, [fetchCases]);

    return {
        cases,
        loading,
        error,
        hasMore,
        loadMore,
        refetch: () => fetchCases(0)
    };
};

export const useMedicalDetail = (id) => {
    const [medicalCase, setMedicalCase] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCase = useCallback(async () => {
        const { data, error } = await medicalModel.fetchMedicalCaseById(id);
        if (error) console.error(error);
        else setMedicalCase(data);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchCase();

        const channel = medicalModel.subscribeToMedicalCase(id, (payload) => {
            setMedicalCase(payload.new);
        });

        return () => {
            medicalModel.removeChannel(channel);
        };
    }, [id, fetchCase]);

    return { medicalCase, loading, setMedicalCase, refetch: fetchCase };
};

export default useMedicalController;
