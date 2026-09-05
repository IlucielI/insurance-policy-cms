import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  summary?: Record<string, any>;
}

export const exportToPDF = (reportData: ReportData) => {
  const doc = new jsPDF();
  const { title, data, columns, summary } = reportData;
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, 30);
  
  let yPos = 45;
  
  // Headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  columns.forEach((col, index) => {
    doc.text(col, 14 + (index * 40), yPos);
  });
  
  // Data rows
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  data.slice(0, 30).forEach((row, rowIndex) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    columns.forEach((col, colIndex) => {
      const value = String(row[col.toLowerCase().replace(/\s+/g, '_')] || '');
      doc.text(value.substring(0, 15), 14 + (colIndex * 40), yPos);
    });
    
    yPos += 7;
  });
  
  // Summary
  if (summary) {
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 14, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    
    Object.entries(summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, yPos);
      yPos += 7;
    });
  }
  
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportToExcel = (reportData: ReportData) => {
  const { title, data, summary } = reportData;
  
  const wb = XLSX.utils.book_new();
  
  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Summary sheet
  if (summary) {
    const summaryData = Object.entries(summary).map(([key, value]) => ({
      Metric: key,
      Value: value
    }));
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  }
  
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
