import React, { useState } from 'react';
import axios from 'axios';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { FaCloudUploadAlt } from "react-icons/fa";
import { Spin } from 'antd';
const { Dragger } = Upload;

const FileUpload = ({data}) => {
  const [files, setFiles] = useState([]); // Change to array
  const [parsedData, setParsedData] = useState([]); // Store all parsed data
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState(''); // New state for resume text
  const [loading, setLoading] = useState(false);
  const handleFileChange = (info) => {
    const { fileList } = info;
    setFiles(fileList.map(file => file.originFileObj)); // Convert fileList to array of File objects
  };

  console.log(">>>>>>>>>>>>>>>>.", data)
  

  const handleUpload = async () => {
    if (files.length === 0) return alert('Please select files to upload');
    setLoading(true); // Start loading spinner
    for (const file of files) {
      const formData = new FormData();
      formData.append('resume', file);


      if (data) {
        formData.append('data', JSON.stringify(data)); // Convert `data` to a JSON string
      }
  
      try {
        const response = await axios.post('https://resume-parsing-server.vercel/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        // Prepare user data
        const skillScores = response.data.skillScores || {};
        const bestSuitedSkill = Object.keys(skillScores).reduce((a, b) => skillScores[a] > skillScores[b] ? a : b, Object.keys(skillScores)[0]);
  
        const newUserData = {
          resume: response.data.text,
          name: response.data.name || 'Not mentioned',
          email: response.data.email || 'Not mentioned',
          phone: response.data.phone || 'Not mentioned',
          college: response.data.college || 'Not mentioned',
          skillScores: skillScores,
          educationPercentages: response.data.educationPercentages || {},
          bestSuitedSkill: bestSuitedSkill || 'Not mentioned', // Set best suited skill based on highest score
          resumeName: file.name
        };
  
        setResumeText(response.data.text); // Set the resume text
  
        // Check if any skill score is greater than 70%
        const hasHighSkillScore = Object.values(skillScores).some(score => score >= 0);
  
        if (hasHighSkillScore) {
          // Append new user data to parsedData state
          setParsedData(prevData => [...prevData, newUserData]);
  
          // Store the updated array back in local storage
          const existingData = localStorage.getItem('candidate');
          const parsedExistingData = existingData ? JSON.parse(existingData) : [];
          parsedExistingData.push(newUserData);
          // localStorage.setItem('candidate', JSON.stringify(parsedExistingData));
        }
  
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error processing the resume. Please try again.');
      }
    }
    setLoading(false); // Stop loading spinner
    message.success('All resumes have been processed and stored in local storage.');
  };

  const handleDownloadCSV = () => {
    // Step 1: Retrieve existing data from local storage
    const existingData = localStorage.getItem('candidate');
    const parsedData = existingData ? JSON.parse(existingData) : [];
  
    // Step 2: Prepare CSV rows
    const csvRows = [];
    const headers = ['Name', 'Email', 'Phone', 'College', '10th', '12th', 'UG', 'PG', 'Best Suited Skill','Resume Name']; // Add header for Best Suited Skill
  
    // Add skill headers dynamically
    const skillHeaders = new Set();
    parsedData.forEach(data => {
      Object.keys(data.skillScores).forEach(skill => skillHeaders.add(skill));
    });
    skillHeaders.forEach(skill => headers.push(skill));
  
    csvRows.push(headers.join(',')); // Add headers
  
    // Step 3: Populate CSV rows
    parsedData.forEach(data => {
      const row = [];
      row.push(data.name || 'Not mentioned');
      row.push(data.email || 'Not mentioned');
      row.push(data.phone || 'Not mentioned');
      row.push(data.college || 'Not mentioned');
      row.push(data.educationPercentages['10th'] || 'Not mentioned');
      row.push(data.educationPercentages['12th'] || 'Not mentioned');
      row.push(data.educationPercentages['UG'] || 'Not mentioned');
      row.push(data.educationPercentages['PG'] || 'Not mentioned');
      row.push(data.bestSuitedSkill || 'Not mentioned'); // Add Best Suited Skill
      row.push(data.resumeName || 'Not mentioned');

      // Add skill scores
      skillHeaders.forEach(skill => {
        row.push(data.skillScores[skill] || 'Not mentioned');
      });

      csvRows.push(row.join(',')); // Add row
    });

    const csvString = csvRows.join('\n');

    // Step 4: Create a Blob and download link
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'candidate.csv');
    a.click();
    window.URL.revokeObjectURL(url); // Clean up
  };

  return (
    <div className="container">
      
      <div className="form-container">
        <Dragger 
          name="file" 
          multiple 
          action="http://localhost:5000/upload" 
          onChange={handleFileChange} 
          onDrop={(e) => console.log('Dropped files', e.dataTransfer.files)}
        >
          <p className="ant-upload-drag-icon">
            <FaCloudUploadAlt  className='upload'/>
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
         
        </Dragger>
        <Button type='primary' className='uploadResume' onClick={handleUpload}>Upload Resumes</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {parsedData.length > 0 && (
        <div className="parsed-data">
          <h3>Parsed Resumes:</h3>
          {parsedData.map((data, index) => (
            <div key={index} className="detail">
              <h4>Resume {index + 1}</h4>
              <p>Name: {data.name}</p>
              <p>Email: {data.email}</p>
              <p>Phone: {data.phone}</p>
              <p>College: {data.college}</p>
              <p>Best Suited Skill: {data.bestSuitedSkill}</p>
              <h5>Skills Breakdown:</h5>
              <ul>
                {Object.keys(data.skillScores).map(skill => (
                  <li key={skill}>{skill}: {data.skillScores[skill]}%</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Button type='primary' className='downloadCSV' onClick={handleDownloadCSV}>Download Excel</Button>
    </div>
  );
};

export default FileUpload;