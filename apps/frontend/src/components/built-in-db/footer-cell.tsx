import { cn } from '@/lib/cn';
export const FooterCell = ({ table, className }) => {
  const meta = table.options.meta;
  return (
    <div className="footer-buttons">
      <button className={cn('add-button', className)} onClick={meta?.addRow}>
        Add New +
      </button>
    </div>
  );
};
