import React, { useState, useEffect } from 'react';
import { GetReportsRequest, GenerateSalesReportRequest } from '../Request/AnalyticsRequest.jsx';
import { format } from 'date-fns';
import { showError } from '../Components/ToasterComponent.jsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Report = () => {
    const [reports, setReports] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await GetReportsRequest();
            if (response.status === 'Success') {
                setReports(response.data);
            }
        } catch (error) {
            showError('Failed to fetch reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            showError('Please select both start and end dates');
            return;
        }

        try {
            setIsLoading(true);
            const response = await GenerateSalesReportRequest({ startDate, endDate });
            if (response.status === 'Success') {
                fetchReports();
                setStartDate('');
                setEndDate('');
            }
        } catch (e) {
            showError('Failed to generate sales report', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reports || reports.length === 0) {
            showError('No reports available to download');
            return;
        }

        try {
            setIsLoading(true);

            // Create a clone of the table with simplified styling
            const tableElement = document.getElementById('report-table');
            const clone = tableElement.cloneNode(true);

            // Remove problematic CSS classes and inline styles
            clone.classList.remove('divide-y', 'divide-gray-200');
            clone.querySelectorAll('*').forEach(el => {
                el.classList.remove(
                    'bg-gray-50',
                    'bg-white',
                    'hover:bg-blue-700',
                    'focus:border-indigo-300',
                    'focus:ring-indigo-200'
                );

                // Remove inline styles that might cause issues
                el.removeAttribute('style');
            });

            // Apply simplified styling for PDF
            clone.style.border = '1px solid #000';
            clone.querySelectorAll('th, td').forEach(el => {
                el.style.border = '1px solid #000';
                el.style.padding = '8px';
            });

            // Temporarily append the clone to the body
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            document.body.appendChild(clone);

            // Generate PDF from the simplified table
            const canvas = await html2canvas(clone, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#FFFFFF'
            });

            // Remove the clone
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; // Slightly smaller than A4 width to account for margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save('sales_report.pdf');

        } catch (error) {
            console.error('PDF generation error:', error);
            showError('Failed to generate PDF');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>

            {/* Form to generate new report */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">Generate New Sales Report</h2>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            {/* Reports List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Generated Reports</h2>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isLoading || reports.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
                    >
                        {isLoading ? 'Generating PDF...' : 'Download as PDF'}
                    </button>
                </div>
                {isLoading ? (
                    <p>Loading reports...</p>
                ) : reports.length === 0 ? (
                    <p>No reports available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table id="report-table" className="min-w-full border-collapse">
                            <thead>
                            <tr>
                                <th className="border px-6 py-3 text-left text-xs font-medium uppercase">Report ID</th>
                                <th className="border px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                                <th className="border px-6 py-3 text-left text-xs font-medium uppercase">Generated At</th>
                                <th className="border px-6 py-3 text-left text-xs font-medium uppercase">Total Sales</th>
                                <th className="border px-6 py-3 text-left text-xs font-medium uppercase">Order Count</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reports.map((report) => {
                                const data = JSON.parse(report.dataJson);
                                return (
                                    <tr key={report.reportId}>
                                        <td className="border px-6 py-4 whitespace-nowrap text-sm">{report.reportId}</td>
                                        <td className="border px-6 py-4 whitespace-nowrap text-sm">{report.reportType}</td>
                                        <td className="border px-6 py-4 whitespace-nowrap text-sm">
                                            {format(new Date(report.generatedAt), 'PPp')}
                                        </td>
                                        <td className="border px-6 py-4 whitespace-nowrap text-sm">
                                            ${parseFloat(data.TotalSales).toFixed(2)}
                                        </td>
                                        <td className="border px-6 py-4 whitespace-nowrap text-sm">{data.OrderCount || 'N/A'}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;