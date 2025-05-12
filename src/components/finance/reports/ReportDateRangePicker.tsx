
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { FileText, Download } from 'lucide-react';

interface ReportDateRangePickerProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const ReportDateRangePicker: React.FC<ReportDateRangePickerProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onExportPDF,
  onExportExcel
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <Label>Data Inicial</Label>
          <DatePicker
            date={startDate}
            setDate={(date) => date && setStartDate(date)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Final</Label>
          <DatePicker
            date={endDate}
            setDate={(date) => date && setEndDate(date)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" onClick={onExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>
      </div>
    </div>
  );
};

export default ReportDateRangePicker;
