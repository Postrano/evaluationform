"use client";
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { db, collection, addDoc, getDocs,getDoc,doc,query,where,deleteDoc } from '../../../script/firebaseConfig';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
const EvaluationForm = () => {
    const [employeeName, setEmployeeName] = useState('');
    const [evaluationDate, setEvaluationDate] = useState('');
    const [evaluationRemarks, setEvaluationRemarks] = useState('');
    const [employeeData, setEmployeeData] = useState([]);
 
    const [loading, setLoading] = useState(true); // Track loading state
     const router = useRouter();
    
  


const [employeeNames, setEmployeeNames] = useState([]);
const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
const [selectedEmployeeName, setSelectedEmployeeName] = useState("");

const [selectedEmployeeEvaluations, setSelectedEmployeeEvaluations] = useState({});

const [evaluations, setEvaluations] = useState([]);

  
   
    
    const [criteria] = useState([
        "Productivity", "Work Quality", "Technical Skills", "Work Consistency", "Enthusiasm", 
        "Cooperation", "Attitude", "Initiative", "Creativity", "Punctuality", "Dependability", 
        "Communication Skill", "Attendance"
    ]);

    useEffect(() => {
          // Fetch employee data from evaluations documents and their sub-collections
                const fetchEmployeeData = async () => {
                    try {
                        const querySnapshot = await getDocs(collection(db, "evaluations"));
                        const employeeSet = new Set();
                        const employeeList = [];
            
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            const name = data.Name;
            
                            if (name && !employeeSet.has(name)) {
                                employeeSet.add(name);
                                employeeList.push({ id: doc.id, name });
                            }
                        });
            
                        console.log("Fetched Employee List:", employeeList);
                        employeeList.sort((a, b) => a.name.localeCompare(b.name));
                        setEmployeeNames(employeeList);
                    } catch (error) {
                        console.error("Error fetching employee names:", error);
                    }
                };
            
                fetchEmployeeData();
            }, []);



            // Fetch evaluations from Firestore for a selected employee
            const fetchEvaluationData = async (employeeName) => {
                try {
                    const evaluationsRef = collection(db, "evaluations");
                    const querySnapshot = await getDocs(query(evaluationsRef, where("Name", "==", employeeName)));
            
                    if (!querySnapshot.empty) {
                        const evaluations = {};
            
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            const date = data.Date || "Unknown Date";
            
                            evaluations[date] = {
                                productivity: data.Productivity || "N/A",
                                workQuality: data["Work Quality"] || "N/A",
                                technicalSkills: data["Technical Skills"] || "N/A",
                                workConsistency: data["Work Consistency"] || "N/A",
                                enthusiasm: data.Enthusiasm || "N/A",
                                cooperation: data.Cooperation || "N/A",
                                attitude: data.Attitude || "N/A",
                                initiative: data.Initiative || "N/A",
                                creativity: data.Creativity || "N/A",
                                punctuality: data.Punctuality || "N/A",
                                dependability: data.Dependability || "N/A",
                                communicationSkill: data["Communication Skill"] || "N/A",
                                attendance: data.Attendance || "N/A",
                                remarks: data.remarks || "No remarks",
                                grade: data.grade || "N/A",
                                date: date
                            };
                        });
            
                        setSelectedEmployeeData(evaluations);
                    } else {
                        console.log("No evaluations found for this employee.");
                        setSelectedEmployeeData(null);
                    }
                } catch (error) {
                    console.error("Error fetching evaluations:", error);
                }
            };
            

            const loadEvaluations = () => {
                    return employeeData.map((employee, index) => (
                        <div key={index} className="border-b-2 py-4">
                            <h3 className="text-xl font-semibold">{employee}</h3>
                        </div>
                    ));
                };

            const generateTable = () => {
                    return criteria.map((criterion, index) => (
                        <tr key={index}>
                            <td className="px-4 py-3">{criterion}</td>
                            <td className="px-4 py-3 text-center">
                                <input type="radio" name={`rating-${criterion}`} value="Excellent" />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <input type="radio" name={`rating-${criterion}`} value="Good" />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <input type="radio" name={`rating-${criterion}`} value="Average" />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <input type="radio" name={`rating-${criterion}`} value="Needs Improvement" />
                            </td>
                        </tr>
                    ));
                };

            const handleSubmit = async () => {
                if (employeeName === "" || evaluationDate === "") {
                    return alert("Please enter a name and date");
                }
            
                let totalScore = 0;
                let selectedCriteria = {};
                const checkboxes = document.querySelectorAll("table input:checked");
            
                // Map of evaluation values to numerical scores
                const scoreMapping = {
                    "Excellent": 100,
                    "Good": 80,
                    "Average": 60,
                    "Needs Improvement": 40
                };
            
                checkboxes.forEach(cb => {
                    const criterionName = cb.closest("tr").querySelector("td").innerText.trim();
                    const value = cb.value; // Get the value (Excellent, Good, etc.)
            
                    // Ensure the value exists in the mapping and add the corresponding score
                    if (scoreMapping[value] !== undefined) {
                        selectedCriteria[criterionName] = `${value}`; // Keep the percentage for display
                        totalScore += scoreMapping[value];  // Add the numeric score to total
                    }
                });
            
                if (Object.keys(selectedCriteria).length === 0) {
                    return alert("Please select evaluation criteria");
                }
            
                // Calculate grade based on the total score and the number of selected criteria
                const grade = Math.round(totalScore / checkboxes.length);  // Calculate grade as an integer percentage
            
                // Prepare the data for saving
                const evaluationData = {
                    Name: employeeName,
                    Date: evaluationDate,
                    ...selectedCriteria,
                    remarks: evaluationRemarks,
                    grade: `${grade}%`  // Store the grade as a string with a '%' symbol
                };
            
                // Save to Firestore
                try {
                    await addDoc(collection(db, "evaluations"), evaluationData);
                    alert("Employee evaluation saved successfully");
            
                    // Reset form after submission
                    setEmployeeName('');
                    setEvaluationDate('');
                    setEvaluationRemarks('');
                } catch (e) {
                    alert("Error adding document: " + e);
                }
            };
            
            
                // Handle selecting an employee from the list
            const handleEmployeeClick = (employeeName) => {
                    setEmployeeName(employeeName); // Set the selected employee's name
                    fetchEvaluationData(employeeName); // Fetch evaluations when employee is selected
            };
     
 
 

            const handleDownloadCSV = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "evaluations"));
      const allEvaluations = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const evaluationRow = {
          Name: data.Name || "Unknown",
          Date: data.Date || "N/A",
          Productivity: data.Productivity || "N/A",
          "Work Quality": data["Work Quality"] || "N/A",
          "Technical Skills": data["Technical Skills"] || "N/A",
          "Work Consistency": data["Work Consistency"] || "N/A",
          Enthusiasm: data.Enthusiasm || "N/A",
          Cooperation: data.Cooperation || "N/A",
          Attitude: data.Attitude || "N/A",
          Initiative: data.Initiative || "N/A",
          Creativity: data.Creativity || "N/A",
          Punctuality: data.Punctuality || "N/A",
          Dependability: data.Dependability || "N/A",
          "Communication Skill": data["Communication Skill"] || "N/A",
          Attendance: data.Attendance || "N/A",
          Remarks: data.remarks || "N/A",
          Grade: data.grade || "N/A",
        };
  
        allEvaluations.push(evaluationRow);
      });
  
      // Convert to CSV
      const worksheet = XLSX.utils.json_to_sheet(allEvaluations);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
      // Create and download the CSV file
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
  
      link.setAttribute("href", url);
      link.setAttribute("download", "Employee_Evaluations.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
            };


            const handleDeleteEvaluation = async (dateToDelete) => {
                console.log("Deleting evaluation for date:", dateToDelete); // Debugging log
                try {
                    // Query to find all evaluations for the selected employee (no date filter here)
                    const q = query(
                        collection(db, "evaluations"),
                        where("Name", "==", selectedEmployeeName) // Filter by the employee's name
                    );

                    const querySnapshot = await getDocs(q); // Fetch all evaluations for the selected employee

                    if (querySnapshot.empty) {
                        console.log("No evaluations found for this employee.");
                        return; // If no evaluations found, exit the function
                    }

                    // Loop through all fetched evaluations and check if the date matches
                    let evaluationFound = false; // Flag to track if an evaluation matching the date is found
                    for (const evaluationDoc of querySnapshot.docs) {
                        const evaluationData = evaluationDoc.data();
                        const evaluationDate = evaluationData.Date;

                        if (evaluationDate === dateToDelete) {
                            // If the date matches, delete the document
                            console.log("Deleting evaluation document:", evaluationDoc.id); // Debugging log
                            await deleteDoc(doc(db, "evaluations", evaluationDoc.id)); // Delete the document
                            evaluationFound = true;
                            break; // Stop after finding and deleting the matching evaluation
                        }
                    }

                    if (!evaluationFound) {
                        console.log("No matching evaluation found for this date.");
                    }

                    // Optional: Refresh data after deletion
                    fetchEvaluationData(selectedEmployeeName); // Refetch evaluations for the selected employee
                } catch (error) {
                    console.error("Error deleting evaluation:", error); // Handle any errors
                }
            };


            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-black">
                         <div className="float-right">
                            <button
                                onClick={() => router.push("/")}
                                className="flex items-center w-auto px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                HOME
                            </button>
                         </div>

               
                       
                        <h1 className="text-2xl font-bold mb-6">Employee Evaluation Form</h1>
                          

                   
            
                    {/* Employee Selector */}
                    <div className="mb-4">
                        <label>Select an Employee:</label>
                        <select
                            value={selectedEmployeeName}
                            onChange={(e) => {
                                const name = e.target.value;
                                setSelectedEmployeeName(name);
                                handleEmployeeClick(name);
                            }}
                            className="border p-2 rounded"
                        >
                            <option value="">-- Select --</option>
                            {employeeNames.map(emp => (
                                <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                        </select>

                    </div>

                    
            
                    {/* Evaluation Form */}
                    <div className="w-full max-w-3xl bg-white shadow-md p-6 rounded">
                        <input
                            className="border p-2 w-full mb-2"
                            type="text"
                            placeholder="Employee Name"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                        />
                        <input
                            className="border p-2 w-full mb-2"
                            type="date"
                            value={evaluationDate}
                            onChange={(e) => setEvaluationDate(e.target.value)}
                        />
                        <textarea
                            className="border p-2 w-full mb-2"
                            placeholder="Remarks"
                            value={evaluationRemarks}
                            onChange={(e) => setEvaluationRemarks(e.target.value)}
                        ></textarea>
            
                        <table className="w-full border-collapse border border-gray-300 mb-4">
                            <thead>
                                <tr>
                                    <th className="border p-2">Criteria</th>
                                    <th className="border p-2">Excellent</th>
                                    <th className="border p-2">Good</th>
                                    <th className="border p-2">Average</th>
                                    <th className="border p-2">Needs Improvement</th>
                                </tr>
                            </thead>
                            <tbody>{generateTable()}</tbody>
                        </table>
            
                        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Submit Evaluation
                        </button>


                         
                    </div>
            
                    {/* Evaluation Viewer */} 
                    {selectedEmployeeData && (
                        <div className="mt-6 w-full max-w-4xl">
                            <h2 className="text-xl font-semibold mb-2">
                            Previous Evaluations for {selectedEmployeeName}
                            </h2>
                            {Object.entries(selectedEmployeeData).map(([date, evaluation]) => (
                            <div key={date} className="border p-4 mb-3 rounded bg-white shadow-sm">
                                <h3 className="text-lg font-bold">{date}</h3>

                                <ul className="list-none mt-2 space-y-2">
                                <li><strong>✅ Productivity:</strong> {evaluation.productivity}</li>
                                <li><strong>🎯 Work Quality:</strong> {evaluation.workQuality}</li>
                                <li><strong>🛠 Technical Skills:</strong> {evaluation.technicalSkills}</li>
                                <li><strong>🔄 Work Consistency:</strong> {evaluation.workConsistency}</li>
                                <li><strong>🔥 Enthusiasm:</strong> {evaluation.enthusiasm}</li>
                                <li><strong>🤝 Cooperation:</strong> {evaluation.cooperation}</li>
                                <li><strong>💡 Attitude:</strong> {evaluation.attitude}</li>
                                <li><strong>🚀 Initiative:</strong> {evaluation.initiative}</li>
                                <li><strong>🎨 Creativity:</strong> {evaluation.creativity}</li>
                                <li><strong>⏰ Punctuality:</strong> {evaluation.punctuality}</li>
                                <li><strong>🔗 Dependability:</strong> {evaluation.dependability}</li>
                                <li><strong>📢 Communication Skills:</strong> {evaluation.communicationSkill}</li>
                                <li><strong>📅 Attendance:</strong> {evaluation.attendance}</li>
                                </ul>

                                <p className="mt-2"><strong>📝 Remarks:</strong> {evaluation.remarks}</p>
                                <p className="font-bold text-lg">🏆 Grade: {evaluation.grade}</p>

                                <button
                                onClick={() => handleDeleteEvaluation(date)}
                                className="mt-2 text-black-600 hover:underline bg-red-500 p-3 rounded-2xl "
                                >
                                Delete Evaluation
                                </button>
                            </div>
                            ))}
                        </div>
                    )}
            
                    <button onClick={handleDownloadCSV} className="mt-6 bg-green-600 text-white px-4 py-2 rounded">
                        Download All Evaluations as CSV
                    </button>
                </div>
            );
            

};

export default EvaluationForm;


