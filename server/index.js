const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import cors
const app = express();
const port = 5000;
const _ = require('lodash');

app.use(cors());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Required skills to check
const requiredSkills = ['Java', 'Node', 'Python', 'C/C++'];

// Define subskills for each required skill
const skillSubskills = {
  Java: ['Core Java', 'Java 8', 'Collections', 'JDBC', 'SQL', 'MYSQL', 'Exception Handling', 'Multithreading', 'DSA', 'Spring Boot', 'REST API', 'MVC Framework', 'AWS', 'Azure'],
  Python: ['Django', 'Flask', 'ORM', 'SQLAlchemy', 'REST API', 'Pandas', 'Numpy', 'OOPs'],
  "Node": ['Express', 'REST API', 'Socket.io', 'JWT Authentication', "JWT", "Joi", "Toaster",'fs', 'path', 'os', 'http', 'https', 'events', 'Global vs local packages', 'Building', 'Middleware', 'Routing', 'Promises', 'async/await', 'Clustering', 'WebSocket', 'redis', 'Caching', 'Jest'],
  "C/C++": ['Memory Management', 'Pointers', 'Data Structures', 'Searching and Sorting Algorithms'],
};

// Function to add a subskill
function addSubskill(skill, subskill) {
  // Convert skill to lowercase for case-insensitive handling
  const lowerSkill = skill.toLowerCase();

  // Check if the skill exists in the object
  if (skillSubskills[skill] || skillSubskills[lowerSkill]) {
    // Use the original skill if it exists, otherwise use the lowercase version
    const existingSkill = skillSubskills[skill] ? skill : lowerSkill;

    // Check if the subskill already exists to avoid duplicates
    if (!skillSubskills[existingSkill].includes(subskill)) {
      skillSubskills[existingSkill].push(subskill);
    } else {
      console.log(`${subskill} already exists under ${existingSkill}.`);
    }
  } else {
    console.log(`Skill ${skill} does not exist.`);
  }
}

// Function to extract skills from the resume text
const extractSkills = (text) => {
  // Improved pattern to account for different variations of skills
  const skillPattern = /\b(Java|Node(?:\.js)?|Python|C\/C\+|C)\b/g;
  const detectedSkills = text.match(skillPattern) || [];

  // Merge and deduplicate detected skills
  const mergedSkills = detectedSkills.map(skill => {
    if (skill === 'Node' || skill === 'Node.js') {
      return 'Node'; // Normalize Node.js and Node to "Node"
    }
    if (skill === 'C' || skill === 'C++') {
      return 'C/C++'; // Normalize C and C++ to "C/C++"
    }
    return skill;
  });

  const uniqueSkills = _.uniq(mergedSkills);
  return uniqueSkills;
};


// Check for subskills in the text
const extractSubskills = (text, skill) => {
  console.log(`Extracting subskills for skill: ${skill}`); // Log the skill being checked

  if (!skillSubskills[skill]) {
    console.log(`No subskills found for skill: ${skill}`); // Log if no subskills are available
    return [];
  }

  const foundSubskills = skillSubskills[skill].filter(subskill => text.includes(subskill));

  console.log(`Found subskills for ${skill}: ${foundSubskills.join(', ')}`); // Log the found subskills
  return foundSubskills;
};

const extractCertifications = (text) => {
  const certPattern = /(Acquired|Obtained|Earned|Certificate|Certified|Course).*?\./g;
  const certifications = text.match(certPattern) || [];

  // Filter out any "JavaScript" certifications for "Java"
  return certifications.filter(cert => 
    !cert.toLowerCase().includes('javascript') // Exclude JavaScript from Java skill matching
  );
};

const extractEmail = (text) => {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const emailMatch = text.match(emailPattern);
  return emailMatch ? emailMatch[0] : '';
};

const extractPhone = (text) => {
  const phonePattern = /(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/;
  const phoneMatch = text.match(phonePattern);
  return phoneMatch ? phoneMatch[0] : '';
};

const extractCollege = (text) => {
  // Look for patterns after 'University', 'College', or similar keywords
  const collegePattern = /(University|College)[\s\S]*?(?:\(|,)([\w\s]+?)(?:\)|,)/i;
  const match = text.match(collegePattern);

  if (match) {
    return match[2].trim(); // Return the captured college name (match[2])
  } else {
    return 'Unknown College'; // If no college name is found, return a default message
  }
};

const extractName = (text) => {
  const namePattern = /([A-Z][a-z]+(?: [A-Z][a-z]+)+|[A-Z\s]+(?: [A-Z\s]+)+)/;
  
  const nameMatch = text.match(namePattern);
  
  if (nameMatch) {
    const fullName = nameMatch[0].trim();
    
    if (fullName.match(/[A-Z]\s+[A-Z]/)) {
      const parts = fullName.split(' ');
      parts.pop(); 
      return parts.join(' '); 
    }
    
    return fullName;
  } else {
    return 'Unknown Name'; // If no name is found, return default text
  }
};


const extractProjects = (text) => {
  // Define a regex to capture projects - assuming format like "Project Title | Skills Used"
  const projectPattern = /([A-Za-z0-9\s\-\_]+?)\s*\|\s*(.*?)\s*(\d{4})/g; // Example regex pattern for Project Title | Skills | Date
  let projects = [];
  let match;

  while ((match = projectPattern.exec(text)) !== null) {
    const projectTitle = match[1].trim();
    const skillsUsed = match[2].trim();
    const year = match[3].trim();
    
    projects.push({ title: projectTitle, skillsUsed: skillsUsed, year });
  }

  return projects;
};

// Function to calculate the score based on skills, projects, and certifications
const calculateScore = (skillsDetected, projects, certifications, text) => {
  let skillScores = {};
  let totalScore = 0;

  console.log("------------------------------------------------------------")

  requiredSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    let skillScore = 0;

    console.log("*****************************************")

    // Check if the primary skill is detected
    if (skillsDetected.some(s => s.toLowerCase() === skillLower)) {
      skillScore += 10; // Add 10% for the primary skill
      console.log(`${skill}: Detected skill, adding 10% score`);
    }

    // Check for subskills and add score for each found
    const subskillsDetected = extractSubskills(text, skill);
    if (subskillsDetected.length > 0) {
      subskillsDetected.forEach(subskill => {
        skillScore += 10; // Add 10% for each subskill detected
        console.log(`${skill}: Detected subskill "${subskill}", adding 10% score`);
      });
    }

    // Check if any projects mention this skill or any of its subskills
    projects.forEach(project => {
      const projectDescription = `${project.title} ${project.skillsUsed} ${project.description}`.toLowerCase();

      let projectMatchFound = false;

      // Check for skill or any subskill in the project description and skills used
      if (
        subskillsDetected.some(subskill => projectDescription.includes(subskill.toLowerCase())) ||
        projectDescription.includes(skillLower)
      ) {
        projectMatchFound = true;
        console.log(`${skill}: Detected relevant skill or subskill in project "${project.title}", adding 20% score from project`);
      }

      if (projectMatchFound) {
        skillScore += 20; // Relevant project skill match
      }
    });

    // Only add project and certification points if skill is detected
    if (skillScore > 0) {
      if (certifications.some(cert => cert.toLowerCase().includes(skillLower))) {
        skillScore += 15; // Relevant certification
        console.log(`${skill}: Detected relevant certification, adding 15% score`);
      }
    }

    // Cap the skill score at 100%
    skillScores[skill] = Math.min(skillScore, 100);
    totalScore += skillScores[skill];

    // Log the score for the current skill
    console.log(`${skill}: Total score for this skill: ${skillScores[skill]}%`);
  });

  // Cap the total score at 100%
  totalScore = Math.min(totalScore, 100);
  console.log(`Total score for all skills: ${totalScore}%`);
  return { skillScores, totalScore };
};
const extractEducationPercentages = (text) => {
  // Define patterns for each education level with the required constraints
  const educationPatterns = [
    {
      level: '10th',
      pattern: /(Matric|Senior\s*Secondary|10th)[^10th12thUGPG]*?(\b(?:\d{1,2}(?:\.\d{1,2})?|100)%)/i, // Accept percentages only
    },
    {
      level: '12th',
      pattern: /(Higher\s*Secondary|10\+2|12th)[^10th12thUGPG]*?(\b(?:\d{1,2}(?:\.\d{1,2})?|100)%)/i, // Accept percentages only
    },
    { level: 'UG', pattern: /(Bachelor[\s\S]*?)(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
    { level: 'PG', pattern: /(Master[\s\S]*?)(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
  ];

  const educationPercentages = {};

  educationPatterns.forEach(({ level, pattern }) => {
    const match = text.match(pattern);
    if (match) {
      educationPercentages[level] = match[2].trim(); // Capture the valid percentage or CGPA and trim whitespace
    } else {
      educationPercentages[level] = "Not Mentioned"; // If no valid match found, return "Not Mentioned"
    }
  });

  return educationPercentages;
};








// const extractEducationPercentages = (text) => {
//   // Define patterns to match percentages or CGPA for each education level
//   const educationPatterns = [
//     { level: '10th', pattern: /(Matric|Senior\s*Secondary|10th| Secondary\s*Secondary)[\s\S]*?(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
//     { level: '12th', pattern: /(Higher\s*Secondary|10\+2|12th)[\s\S]*?(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
//     { level: 'UG', pattern: /(Bachelor[\s\S]*?)(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
//     { level: 'PG', pattern: /(Master[\s\S]*?)(\d{2,3}[%]|(?:\d\.\d{1,2})\s*CGPA)/i },
//   ];

//   const educationPercentages = {};

//   educationPatterns.forEach(({ level, pattern }) => {
//     const match = text.match(pattern);
//     if (match) {
//       educationPercentages[level] = match[2]; // Capture the percentage or CGPA
//     } else {
//       educationPercentages[level] = "Not Mentioned"; // If no match found, return "Not Mentioned"
//     }
//   });

//   return educationPercentages;
// };




// Route for handling resume upload
app.post('/upload', upload.single('resume'), (req, res) => {
  const filePath = req.file.path;
  let text = '';

  if (req.file.mimetype === 'application/pdf') {
    const pdfBuffer = fs.readFileSync(filePath);
    pdfParse(pdfBuffer)
      .then(data => {
        text = data.text;

        const skillsDetected = extractSkills(text);
        const certifications = extractCertifications(text);
        const name = extractName(text);
        const email = extractEmail(text);
        const phone = extractPhone(text);
        const college = extractCollege(text);
        
        // Extract education percentages (10th, 12th, UG, PG)
        const educationPercentages = extractEducationPercentages(text);

        // Extract projects from the resume
        const projects = extractProjects(text);

        const { skillScores, totalScore } = calculateScore(skillsDetected, projects, certifications, text);

        res.json({
          text,
          skillScores,
          totalScore,
          name,
          email,
          phone,
          college,
          certifications,
          educationPercentages, // Include the education percentages in the response
        });
      })
      .catch(error => res.status(500).json({ error: 'Error parsing PDF' }));
  } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    textract.fromFileWithPath(filePath, (error, text) => {
      if (error) {
        return res.status(500).json({ error: 'Error extracting text from DOCX file' });
      }

      const skillsDetected = extractSkills(text);
      const certifications = extractCertifications(text);
      const name = extractName(text);
      const email = extractEmail(text);
      const phone = extractPhone(text);
      const college = extractCollege(text);
      
      // Extract education percentages (10th, 12th, UG, PG)
      const educationPercentages = extractEducationPercentages(text);

      // Extract projects from the resume
      const projects = extractProjects(text);

      const { skillScores, totalScore } = calculateScore(skillsDetected, projects, certifications, text);

      res.json({
        text,
        skillScores,
        totalScore,
        name,
        email,
        phone,
        college,
        certifications,
        educationPercentages, // Include the education percentages in the response
      });
    });
  } else {
    res.status(400).json({ error: 'Invalid file type. Only PDF and DOCX are supported.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
