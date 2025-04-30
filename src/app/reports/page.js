"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../script/firebaseConfig';// make sure you set up firebase.js
import { collection, addDoc, getDocs, deleteDoc, doc } from '../../../script/firebaseConfig';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';


const InternalAuditReport = () => {
  const [title, setTitle] = useState('');
  const [written, setWritten] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [reports, setReports] = useState([]);
  const [groupedReports, setGroupedReports] = useState({});
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [activeDept, setActiveDept] = useState(null); // Track selected department

  const departmentsList = [
    'BOD/EXECUTIVE',
    'IT',
    'MARKETING',
    'HUMAN RESOURCE (HR)',
    'OJT'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'audit_reports'));
      const reportList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      // Group reports by department
      const grouped = {};
      reportList.forEach(report => {
        if (!grouped[report.department]) {
          grouped[report.department] = [];
        }
        grouped[report.department].push(report);
      });
  
      setReports(reportList); // all reports
      setGroupedReports(grouped); // grouped by department
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreate = async () => {
    if (!title ||!written ||!department || !date || !description) {
      alert('Please complete the form.');
      return;
    }

    try {
      await addDoc(collection(db, 'audit_reports'), {
        title,
        written,
        department,
        date,
        description
      });

      alert('Report created successfully!');
      setTitle('');
      setWritten('');
      setDepartment('');
      setDate('');
      setDescription('');
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report.');
    }
  };

  const handleOpenReport = (selectedTitle) => {
    const selectedReport = reports.find((r) => r.title === selectedTitle);
    if (selectedReport) {
      setTitle(selectedReport.title);
      setWritten(selectedReport.written);
      setDepartment(selectedReport.department);
      setDate(selectedReport.date);
      setDescription(selectedReport.description);
    }
  };

  const toggleDepartment = (dept) => {
    // Toggle the active department to show its reports
    setActiveDept(activeDept === dept ? null : dept);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const usableWidth = pageWidth - margin * 2;
  
    let cursorY = 18;
  
    // HEADER SECTION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('INTERNAL AUDIT REPORT', pageWidth / 2, cursorY, { align: 'center' });
  
    cursorY += 10;
    doc.setFontSize(10);
    doc.text('INSPIRE INC.', pageWidth / 2, cursorY, { align: 'center' });
  
    // TITLE SECTION
    cursorY += 15;
    doc.setFontSize(12);
    doc.text(title || 'No Title Provided', pageWidth / 2, cursorY, { align: 'center' });
  
    // DEPARTMENT & DATE
    cursorY += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Department: ${department || 'N/A'}`, margin, cursorY);
    doc.text(`Date: ${date || 'N/A'}`, pageWidth - margin, cursorY, { align: 'right' });
  
    // SECTION LINE
    cursorY += 2;
    doc.setDrawColor(150);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
  
    // DESCRIPTION SECTION
    cursorY += 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', margin, cursorY);
  
    cursorY += 8;
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    const descriptionText = description || 'No description provided.';

    // Clean up any non-standard characters like ‘ð’
    const cleanText = descriptionText.replace(/ð/g, '•');

    // Set proper font and size
    doc.setFont('times', 'normal');
    doc.setFontSize(11);

    // Wrap the text cleanly
    const wrappedText = doc.splitTextToSize(cleanText, usableWidth);

    // Add the text with consistent spacing
    wrappedText.forEach(line => {
      if (cursorY + 6 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 6;
    });

  
    // WRITTEN BY (always at end)
    cursorY += 10;
    if (cursorY + 10 > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.text(`WRITTEN BY: ${written || 'N/A'}`, pageWidth / 2, cursorY, { align: 'center' });
  
    // FOOTER LINE (optional)
    doc.setDrawColor(180);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFontSize(10);
    // doc.text('Generated by Audit System', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
    // Save the document
    doc.save(`${title || 'Audit_Report'}.pdf`);
  };
  
  
  
  const deleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const reportRef = doc(db, 'audit_reports', reportId);
        await deleteDoc(reportRef);

        alert('Report deleted successfully!');
        fetchReports(); // Re-fetch the updated list of reports
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report.');
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center p-8">
      {/* Top Navigation */}
      <div className="w-full max-w-6xl bg-gray-500 rounded-t-2xl flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          <h1 className="text-black font-bold">INTERNAL AUDIT REPORTS</h1>

          {/* Titles Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => handleOpenReport(e.target.value)}
              className="bg-gray-400 p-2 rounded"
            >
              <option value="">Select Title</option>
              {reports.map((report) => (
                <option key={report.id} value={report.title}>
                  {report.title}
                </option>
              ))}
            </select>
          </div>

          {/* Departments Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
              className="bg-gray-400 p-2 rounded"
            >
              Departments ▼
            </button>

            {/* Department list (only shown if isDepartmentsOpen is true) */}
            {isDepartmentsOpen && (
              <div className="absolute bg-white text-black mt-1 rounded shadow-lg z-10">
                {departmentsList.map((dept, idx) => (
                  <div key={idx}>
                    <div
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      onClick={() => toggleDepartment(dept)} // Toggle department report visibility
                    >
                      {dept}
                    </div>

                    {/* Show reports for the selected department */}
                    {activeDept === dept && groupedReports[dept] && (
                      <div className="absolute top-0 left-full bg-white text-black rounded shadow-lg ml-2 mt-1">
                        {groupedReports[dept].map((report, rIdx) => (
                          <div
                            key={rIdx}
                            onClick={() => {
                              handleOpenReport(report.title);
                              setIsDepartmentsOpen(false); // Close after selecting
                            }}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                          >
                            {report.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          className="bg-gray-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-600"
        >
          CREATE
        </button>
      </div>

      {/* Form */}
     {/* Form */}
     <div className="w-full max-w-6xl bg-gray-700 rounded-b-2xl flex flex-col items-center p-8">
        <h2 className="text-white font-bold text-xl mb-1">INTERNAL AUDIT REPORT</h2>
        <h3 className="text-white text-sm mb-6">INSPIRE INC.</h3>

        <div className="w-full flex flex-wrap gap-4 justify-center mb-6">
          <div className="flex items-center gap-2">
            <label className="text-white font-bold">TITLE:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-400 rounded p-2"
            />
          </div>
          <div className="flex items-center gap-2">
                <label className="text-white font-bold">WRITTEN BY:</label>
                <input
                    type="text"
                    value={written}
                    onChange={(e) => setWritten(e.target.value)}  
                    className="bg-gray-400 rounded p-2"
                />
                </div>

         
        </div>

        <div className="w-full flex  gap-116 justify-center mb-6">
        <div className="flex items-center gap-2">
            <label className="text-white font-bold">DEPARTMENT:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-gray-400 rounded p-2"
            >
              <option value="">Select</option>
              {departmentsList.map((dept, idx) => (
                <option key={idx} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-white font-bold">DATE:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-400 rounded p-2"
            />
          </div>

        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-48 bg-gray-400 text-black rounded-lg p-4 mb-6"
          placeholder="Enter report details here..."
        ></textarea>

        <div className='flex'>
        <button
          onClick={handleCreate}
          className="bg-white text-black  font-bold py-1 px-4 mr-2.5 rounded-full hover:bg-gray-300"
        >
          Create
        </button>

        <button
          onClick={downloadReport}
          className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-400 mt-4"
        >
          Download as PDF
        </button>
        </div>
        <div className="mt-6">
          <h2 className="text-white font-bold">All Reports</h2>
          {reports.map((report) => (
            <div key={report.id} className="flex justify-between items-center bg-gray-600 p-4 my-2 rounded">
              <span className="text-white mr-2.5">{report.title}</span>
              <button
                onClick={() => deleteReport(report.id)}
                className="bg-red-500 text-white font-bold px-4 py-2 rounded-full hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default InternalAuditReport;
