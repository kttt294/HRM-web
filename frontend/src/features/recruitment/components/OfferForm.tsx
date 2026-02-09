import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface OfferFormProps {
    candidateId: string;
    onClose: () => void;
    onSubmit: (data: OfferData) => void;
}

interface OfferData {
    candidateId: string;
    position: string;
    salary: number;
    startDate: string;
    benefits: string;
}

export function OfferForm({ candidateId, onClose, onSubmit }: OfferFormProps) {
    const [formData, setFormData] = useState<Omit<OfferData, 'candidateId'>>({
        position: '',
        salary: 0,
        startDate: '',
        benefits: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            candidateId,
            ...formData,
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Đề nghị tuyển dụng"
            footer={
                <>
                    <Button onClick={handleSubmit}>Gửi đề nghị</Button>
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <Input
                    label="Vị trí"
                    name="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />

                <Input
                    type="number"
                    label="Mức lương"
                    name="salary"
                    value={String(formData.salary)}
                    onChange={(e) =>
                        setFormData({ ...formData, salary: Number(e.target.value) })
                    }
                />

                <Input
                    type="date"
                    label="Ngày bắt đầu"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                    }
                />

                <Input
                    label="Phúc lợi"
                    name="benefits"
                    value={formData.benefits}
                    onChange={(e) =>
                        setFormData({ ...formData, benefits: e.target.value })
                    }
                />
            </form>
        </Modal>
    );
}
