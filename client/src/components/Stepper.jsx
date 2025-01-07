import React, { useEffect, useState } from 'react';
import { Steps, Input, Button, Select, Row, Col, Typography, Checkbox, Card, Space, message } from 'antd';
import "./stepper.css";
import FileUpload from '../FileUpload';
import { MdCreditScore, MdDelete } from "react-icons/md";
import { GrScorecard } from "react-icons/gr";
import { FaCloudUploadAlt } from "react-icons/fa";
import CustomSelect from './select/CustomeSelect';
import { useForm } from 'react-hook-form';
import CustomInput from './input/CustomeInput';

const Stepper = () => {
    const [currentStep, setCurrentStep] = useState(0); // State to track the current step
    const [selectedSkills, setSelectedSkills] = useState([]); // Selected skills
    const [checkedSkills, setCheckedSkills] = useState([]); // Checked skills
    const [subskills, setSubskills] = useState({}); // Object to store subskills per skill
    const [showSubskills, setShowSubskills] = useState(false);
    const [project, setProject] = useState(false);
    const [certificate, setCertificate] = useState(false)
    const [skillScore, setSkillScore] = useState('');
    const [subSkillScore, setSubSkillScore] = useState('');
    const [projectScore, setProjectScore] = useState('');
    const [certificateScore, setCertificateScore] = useState('');

    const { handleSubmit, control } = useForm()



    const data = {
        selectedSkills,
        checkedSkills,
        subskills,
        project,
        certificate,
        ...skillScore && { skillScore: Number(skillScore) } || 0,
        ...subSkillScore && { subSkillScore: Number(subSkillScore) } || 0,
        ...projectScore && { projectScore: Number(projectScore) } || 0,
        ...certificateScore && { certificateScore: Number(certificateScore) } || 0,
    };

    const handleNextStep = handleSubmit(() => {
        setCurrentStep(currentStep + 1); // Move to the next step

    })


    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1); // Move to the previous step
        }
    };

    const handleChange = (value, skill) => {
        setSubskills((prev) => ({
            ...prev,
            [skill]: value, // Store subskills for the specific skill
        }));
    };

    const handleYesClick = (isClicked) => {
        setShowSubskills(isClicked);
    };

    const handleCheckboxChange = (skill, isChecked) => {
        if (isChecked) {
            setCheckedSkills((prev) => [...prev, skill]); // Add skill to checkedSkills array
        } else {
            setCheckedSkills((prev) => prev.filter((s) => s !== skill)); // Remove skill from checkedSkills
            setSubskills((prev) => {
                const { [skill]: _, ...rest } = prev; // Remove subskills when skill is unchecked
                return rest;
            });
        }
    };


    const handleDeleteSubskill = (skill) => {
        // Remove the skill from checkedSkills
        setCheckedSkills((prev) => prev.filter((s) => s !== skill));

        // Remove subskills for that skill
        setSubskills((prev) => {
            const { [skill]: _, ...rest } = prev;
            return rest;
        });
    };


    const handleProject = (isClicked) => {
        setProject(isClicked); // Set project state based on the button clicked
    };

    const handleCertificate = (isClicked) => {
        setCertificate(isClicked)

    }



    return (
        <div>

            <div className='steps'>
                <Steps
                    size="small"
                    current={currentStep}
                    items={[
                        {
                            title: 'Skills',
                            icon: <MdCreditScore style={{ fontSize: "30px" }} />,
                        },
                        {
                            title: 'Scoring',
                            icon: <GrScorecard />,
                        },
                        {
                            title: 'Upload',
                            icon: <FaCloudUploadAlt />,
                        },

                    ]}
                />
            </div>

            <br />
            <br />
            <br />
            <br />

            {
                currentStep === 0 && (
                    <Row gutter={[16, 24]} >
                        <Card className="card">
                            <Col xs={24} lg={6} md={8}>
                                <Typography className='typo'>Please enter the Skills</Typography>
                                {currentStep === 0 && (
                                    <CustomSelect
                                        control={control}
                                        rules={{ required: 'Please enter a Skill' }}
                                        name={"jassi"}
                                        mode="tags"
                                        onChange={(value) => setSelectedSkills(value)} // Update selected skills
                                        style={{ width: '100%' }}
                                        tokenSeparators={[',']}
                                    />
                                )}
                                <br />
                                <br />

                            </Col>

                            {selectedSkills.length > 0 && (
                                <Col xs={24} lg={6} md={8}>
                                    <p className='typo'>Do these Skills Have their subSkills?</p>
                                    <Button type="primary" className='btn2' onClick={() => handleYesClick(true)}>Yes</Button>
                                </Col>
                            )}

                            {showSubskills && selectedSkills.length > 0 && (
                                <Col xs={24} lg={6} md={8} style={{ display: "flex", flexDirection: "column" }}>
                                    <Typography className='typo'>Please select the skills for which you want to add subskills:</Typography>
                                    {selectedSkills.map((skill, index) => (
                                        <Checkbox
                                            key={index}
                                            onChange={(e) => handleCheckboxChange(skill, e.target.checked)}
                                            checked={checkedSkills.includes(skill)} // Check if the skill is in the checkedSkills array
                                        >
                                            <div className='skills'>{skill}</div>
                                        </Checkbox>
                                    ))}
                                    <MdDelete className='subSkillDlt' onClick={() => handleYesClick(false)} />
                                </Col>
                            )}

                            {checkedSkills.length > 0 && (
                                <Col xs={24} lg={6} md={8} style={{ display: "flex", flexDirection: "column" }}>
                                    <Typography className='typo'>
                                        Sub Skills for the selected skills:
                                    </Typography>
                                    {checkedSkills.map((skill, index) => (
                                        <div key={index} style={{ marginBottom: "16px" }}>
                                            <p className='typo'>Sub Skills for {skill}</p>
                                            <div className='check'>
                                                <Select
                                                    mode="tags"
                                                    value={subskills[skill] || []} // Use the subskills for the skill
                                                    onChange={(value) => { handleChange(value, skill) }} // Update subskills for specific skill
                                                    style={{ width: "100%" }}
                                                    tokenSeparators={[","]}
                                                />
                                                <MdDelete
                                                    className='dlt'
                                                    onClick={() => handleDeleteSubskill(skill)} // Call handleDeleteSubskill on click
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </Col>
                            )}
                        </Card>
                    </Row>
                )
            }



            {
                currentStep === 1 && (
                    <Row gutter={[16, 24]}>
                        <Card className='card'>

                            <Col xs={24} lg={6} md={8}>
                                <Typography className='typo'>Do you want to give score for Project?</Typography>
                                <Space>
                                    <Button type='primary' onClick={() => handleProject(true)}>Yes</Button>
                                    <Button onClick={() => handleProject(false)}>No</Button>
                                </Space>
                            </Col>


                            <Col xs={24} lg={6} md={8}>
                                <Typography className='typo'>Do you want to give score for Certifications?</Typography>
                                <Space>
                                    <Button type='primary' onClick={() => handleCertificate(true)}>Yes</Button>
                                    <Button onClick={() => handleCertificate(false)}>No</Button>
                                </Space>
                            </Col>

                            <br />
                            <br />

                            <Col xs={24} lg={6} md={8}>
                                <Typography className='typo'>Please mentioned  how do you want to give scoring</Typography>
                            </Col>



                            <Col xs={24} lg={6} md={8}>
                                <Typography className='typo'>Score For Skills :</Typography>
                                <Input
                                    name="skillScore"
                                    className='skillScoring'
                                    placeholder='scoring...'
                                    value={skillScore}
                                    onChange={(e) => setSkillScore(e.target.value)}
                                    rules={{ required: "please enter skill Score" }}
                                />
                            </Col>


                            {
                                showSubskills && (
                                    <Col xs={24} lg={6} md={8}>
                                        <Typography className='typo'>Score For Sub Skills :</Typography>
                                        <Input
                                            name="subSkillScore"
                                            className='skillScoring'

                                            placeholder='scoring...'
                                            value={subSkillScore}
                                            onChange={(e) => setSubSkillScore(e.target.value)}
                                        />
                                    </Col>
                                )
                            }

                            {
                                project && (
                                    <Col xs={24} lg={6} md={8}>
                                        <Typography className='typo'>Score For Per Project :</Typography>
                                        <Input
                                            name="projectScore"
                                            className='skillScoring'

                                            placeholder='scoring...'
                                            value={projectScore}
                                            onChange={(e) => setProjectScore(e.target.value)}
                                        />
                                    </Col>
                                )
                            }

                            {
                                certificate && (
                                    <Col xs={24} lg={6} md={8}>
                                        <Typography className='typo'>Score For Certifications :</Typography>
                                        <Input
                                            name="certificateScore"
                                            className='skillScoring'

                                            placeholder='scoring...'
                                            value={certificateScore}
                                            onChange={(e) => setCertificateScore(e.target.value)}
                                        />
                                    </Col>

                                )
                            }





                        </Card>

                    </Row>
                )
            }



            {
                currentStep === 2 && (
                    <Card className='card'>

                        <FileUpload data={data} />
                    </Card>
                )
            }









            {currentStep > 0 && (
                <Button type="primary" onClick={handlePrevStep} className='back'>
                    Back
                </Button>
            )}


            {
                currentStep < 2 && (

                    <Button type="primary" onClick={handleSubmit(handleNextStep)} className='next'>
                        Next Step
                    </Button>
                )
            }
        </div>
    );
};

export default Stepper;
