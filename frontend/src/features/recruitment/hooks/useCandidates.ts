import { useState, useCallback, useEffect } from 'react';
import { Candidate } from '../models/candidate.model';
import { candidateApi } from '../services/candidate.api';

export function useCandidates() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await candidateApi.getAll();
            setCandidates(data);
        } catch (err) {
            setError('Không thể tải danh sách ứng viên');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    return {
        candidates,
        isLoading,
        error,
        fetchCandidates,
    };
}
