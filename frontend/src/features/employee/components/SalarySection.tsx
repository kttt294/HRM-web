import { Employee } from '../models/employee.model';
import { formatCurrency } from '../../../shared/utils/format.util';

interface SalarySectionProps {
    employee: Employee;
}

export function SalarySection({ employee }: SalarySectionProps) {
    return (
        <section data-section="salary">
            <h2>Thông tin lương</h2>
            <ul id="salary-info">
                <li><strong>Lương cơ bản:</strong> {formatCurrency(employee.salary)}</li>
                <li><strong>Phụ cấp:</strong> {formatCurrency(employee.allowance)}</li>
                <li><strong>Tài khoản ngân hàng:</strong> {employee.bankAccount}</li>
            </ul>
        </section>
    );
}
