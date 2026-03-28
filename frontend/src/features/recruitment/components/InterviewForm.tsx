import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { interviewApi } from '../services/interview.api';
import { employeeApi } from '../../employee/services/employee.api';
import { useSnackbarStore } from '../../../store/snackbar.store';

interface InterviewFormProps {
    candidateId: string;
    vacancyId: string | number;
    onClose: () => void;
    onSuccess: () => void;
}

interface EmployeeOption {
    id: string;
    fullName: string;
}

export function InterviewForm({ candidateId, vacancyId, onClose, onSuccess }: InterviewFormProps) {
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSnackbar } = useSnackbarStore();
    
    const [formData, setFormData] = useState({
        title: 'Phỏng vấn sơ loại',
        interviewDate: '',
        location: '',
        interviewerId: '',
        interviewerName: '',
        notes: ''
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await employeeApi.getAll();
                setEmployees(data);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.interviewDate || !formData.interviewerId) {
            showSnackbar("Vui lòng nhập đầy đủ ngày phỏng vấn và người phỏng vấn", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            await interviewApi.create({
                candidateId,
                vacancyId,
                title: formData.title,
                interviewDate: formData.interviewDate,
                location: formData.location,
                interviewerId: formData.interviewerId,
                interviewerName: formData.interviewerName,
                notes: formData.notes
            });
            showSnackbar("Lên lịch phỏng vấn thành công!", "success");
            onSuccess();
        } catch (error) {
            console.error("Failed to create interview:", error);
            showSnackbar("Lỗi khi lên lịch phỏng vấn", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Sắp lịch phỏng vấn"
            footer={
                <>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : "Lưu lịch phỏng vấn"}
                    </Button>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                    label="Tiêu đề (Vòng phỏng vấn)"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Input
                    label="Thời gian (Ngày & Giờ)"
                    type="datetime-local"
                    required
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                />

                <Input
                    label="Địa điểm (Phòng họp hoặc Link Online)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Người phỏng vấn</label>
                    <input
                        type="text"
                        list="employees-list"
                        placeholder="Nhập Tên hoặc Mã nhân viên..."
                        className="form-input"
                        value={formData.interviewerName}
                        onChange={(e) => {
                            const val = e.target.value;
                            const emp = employees.find(emp => {
                                const paddedId = String(emp.id).padStart(5, '0');
                                return emp.fullName === val || `[${paddedId}] ${emp.fullName}` === val;
                            });
                            setFormData({
                                ...formData,
                                interviewerName: val,
                                interviewerId: emp ? emp.id : ''
                            });
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px'
                        }}
                    />
                    <datalist id="employees-list">
                        {employees.map(emp => (
                            <option key={emp.id} value={`[${String(emp.id).padStart(5, '0')}] ${emp.fullName}`} />
                        ))}
                    </datalist>
                    {formData.interviewerName && !formData.interviewerId && (
                        <p style={{ fontSize: '11px', color: '#666' }}>Lưu ý: Bạn nên chọn từ danh sách gợi ý để đảm bảo đúng Mã nhân viên</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Ghi chú chuẩn bị</label>
                    <textarea
                        className="form-input"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </form>
        </Modal>
    );
}
