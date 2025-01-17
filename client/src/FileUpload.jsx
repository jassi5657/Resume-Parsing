import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { FaCloudUploadAlt } from "react-icons/fa";
import { Spin } from 'antd';

const { Dragger } = Upload;

const FileUpload = ({ data }) => {
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadAttempted, setUploadAttempted] = useState(false); // Track if upload was attempted

  const handleFileChange = (info) => {
    const { fileList } = info;
    setFiles(fileList.map(file => file.originFileObj));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }
  
    setLoading(true); // Show spinner
    setUploadAttempted(true); // Set upload attempt flag
    setParsedData([]); // Reset parsed data for a new upload attempt
  
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('resume', file);
  
        if (data) {
          formData.append('data', JSON.stringify(data));
        }
  
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        const skillScores = response.data.skillScores || {};
        const bestSuitedSkill = Object.keys(skillScores).reduce((a, b) => 
          skillScores[a] > skillScores[b] ? a : b, 
          Object.keys(skillScores)[0]
        );
  
        const newUserData = {
          resume: response.data.text,
          name: response.data.name || 'Not mentioned',
          email: response.data.email || 'Not mentioned',
          phone: response.data.phone || 'Not mentioned',
          skillScores: skillScores,
          bestSuitedSkill: bestSuitedSkill || 'Not mentioned',
          resumeName: file.name,
        };
  
        const hasHighSkillScore = Object.values(skillScores).some(score => score >= 10);
        if (hasHighSkillScore) {
          setParsedData(prevData => [...prevData, newUserData]);
          const existingData = localStorage.getItem('candidate');
          const parsedExistingData = existingData ? JSON.parse(existingData) : [];
          parsedExistingData.push(newUserData);
          localStorage.setItem('candidate', JSON.stringify(parsedExistingData));
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error processing the resume. Please try again.');
    } finally {
      setLoading(false); // Hide spinner after all resumes are processed
    }
  };
  
  const handleDownloadCSV = () => {
    const existingData = localStorage.getItem('candidate');
    const parsedData = existingData ? JSON.parse(existingData) : [];
    const csvRows = [];
    const headers = ['Name', 'Email', 'Phone', 'Best Suited Skill', 'Resume Name'];
    const skillHeaders = new Set();
    parsedData.forEach(data => {
      Object.keys(data.skillScores).forEach(skill => skillHeaders.add(skill));
    });
    skillHeaders.forEach(skill => headers.push(skill));
    csvRows.push(headers.join(','));

    parsedData.forEach(data => {
      const row = [];
      row.push(data.name || 'Not mentioned');
      row.push(data.email || 'Not mentioned');
      row.push(data.phone || 'Not mentioned');
      row.push(data.bestSuitedSkill || 'Not mentioned');
      row.push(data.resumeName || 'Not mentioned');
      skillHeaders.forEach(skill => {
        row.push(data.skillScores[skill] || 0);
      });

      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'candidate.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('candidate');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Spin spinning={loading} size='large'  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
    <div className="container">
      <div className="form-container">
          <Dragger
            name="file"
            beforeUpload={() => false}
            multiple
            onChange={handleFileChange}
            onDrop={(e) => console.log('Dropped files', e.dataTransfer.files)}
          >
            <p className="ant-upload-drag-icon">
              <FaCloudUploadAlt className='upload' />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
          </Dragger>
          <Button type='primary' className='uploadResume' onClick={handleUpload}>Submit</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {uploadAttempted && parsedData.length === 0 && !loading && (
        <p>No data could be parsed from the uploaded resumes. Please try again with different files.</p>
      )}

      {parsedData.length > 0 && (
        <div className="parsed-data">
          <h3>Parsed Resumes:</h3>
          {parsedData.map((data, index) => (
            <div key={index} className="detail">
              <h4>Resume {index + 1}</h4>
              <p>Name: {data.name}</p>
              <p>Email: {data.email}</p>
              <p>Phone: {data.phone}</p>
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

      

      {localStorage.getItem('candidate') && (
        <Button type='primary' className='downloadCSV' onClick={handleDownloadCSV}>
          Download Excel
        </Button>
      )}
    </div>
              </Spin>
  );
};

export default FileUpload;
