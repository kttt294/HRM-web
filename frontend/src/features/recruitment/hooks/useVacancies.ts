import { useState, useCallback, useEffect } from 'react';
import { Vacancy } from '../models/vacancy.model';
import { recruitmentApi } from '../services/recruitment.api';

export function useVacancies() {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVacancies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await recruitmentApi.getVacancies();
            setVacancies(data);
        } catch (err) {
            setError('Không thể tải danh sách vị trí tuyển dụng');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVacancies();
    }, [fetchVacancies]);

    return {
        vacancies,
        isLoading,
        error,
        fetchVacancies,
    };
}
