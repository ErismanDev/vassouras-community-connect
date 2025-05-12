
import React from 'react';
import { useFinancialReports } from './reports/useFinancialReports';
import ReportDateRangePicker from './reports/ReportDateRangePicker';
import ReportSummary from './reports/ReportSummary';
import MonthlyTrendChart from './reports/MonthlyTrendChart';
import CategoryPieCharts from './reports/CategoryPieCharts';

interface FinancialReportsSectionProps {
  isAdmin: boolean;
}

const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ isAdmin }) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    monthlyData,
    expensesByCategory,
    incomeByCategory,
    summaryData,
    handleExportPDF,
    handleExportExcel
  } = useFinancialReports();
  
  return (
    <div className="space-y-6">
      <ReportDateRangePicker
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />
      
      <ReportSummary
        totalIncome={summaryData.totalIncome}
        totalExpense={summaryData.totalExpense}
        balance={summaryData.balance}
      />
      
      <MonthlyTrendChart monthlyData={monthlyData} />
      
      <CategoryPieCharts
        expensesByCategory={expensesByCategory}
        incomeByCategory={incomeByCategory}
      />
    </div>
  );
};

export default FinancialReportsSection;
