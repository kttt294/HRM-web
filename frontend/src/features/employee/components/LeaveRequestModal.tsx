import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { LeaveRequest } from '../models/leave.model';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    onSubmit: (request: Partial<LeaveRequest>) => void;
}

export function LeaveRequestModal({
    isOpen,
    onClose,
    employeeId,
    onSubmit,
}: LeaveRequestModalProps) {
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            employeeId,
            ...formData,
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Yêu cầu nghỉ phép"
            footer={
                <>
                    <Button onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}>
                        Gửi yêu cầu
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <Select
                    label="Loại nghỉ phép"
                    name="leaveType"
                    options={[
                        { value: 'annual', label: 'Nghỉ phép năm' },
                        { value: 'sick', label: 'Nghỉ ốm' },
                        { value: 'unpaid', label: 'Nghỉ không lương' },
                    ]}
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                />

                <Input
                    type="date"
                    label="Ngày bắt đầu"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />

                <Input
                    type="date"
                    label="Ngày kết thúc"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />

                <Input
                    label="Lý do"
                    name="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
            </form>
        </Modal>
    );
}
