import { useState } from "react";
import "../WelcomePage.css"
import { PersonalInformation } from "../../datatypes/network"
import BlurCover from "../auxiliary/BlurCover";
import WithLabel from "../auxiliary/WithLabel";
import Button from "../auxiliary/Button";
import { PersonalInformationPostResponse } from "../../datatypes/study";

interface IdentificationInputProps {
    isOpen: boolean;
    registrationSuccess: boolean;
    existingPersonalInformation?: PersonalInformation;
    personalInformationResponse?: PersonalInformationPostResponse;
    handleInputConfirmation: (personalInformation: PersonalInformation) => void;
    onClose: () => void;
}

const IdentificationPopup = (props: IdentificationInputProps) => {
    const initialUserName = props.existingPersonalInformation?.userName || "";
    const initialEducationalBackground = props.existingPersonalInformation?.educationalBackground || "";
    const initialOccupation = props.existingPersonalInformation?.occupation || "";
    const initialResearchField = props.existingPersonalInformation?.researchField || "";
    const [username, setUsername] = useState<string>(initialUserName);
    const [educationalBackground, setEducationalBackground] = useState<string>(initialEducationalBackground);
    const [occupation, setOccupation] = useState<string>(initialOccupation);
    const [researchField, setResearchField] = useState<string>(initialResearchField);
    const [clickedRegistrationForm, setClickedRegistrationForm] = useState<boolean>(false);

    const handleChangeUsername = (newUserName : string) => {
        setUsername(newUserName);
    }
    const handleChangeEducationalBackground = (newEducationalBackground : string) => {
        setEducationalBackground(newEducationalBackground);
    }
    const handleChangeOccupation = (newOccupation : string) => {
        setOccupation(newOccupation);
    }
    const handleChangeResearchField = (newResearchField : string) => {
        setResearchField(newResearchField);
    }
    const goToRegistrationForm = () => {
        setClickedRegistrationForm(true);
        window.open("https://docs.google.com/forms/d/e/1FAIpQLSd5lCo5QIOw4lyoDUQO2CvkKHAQEpWRfU4wTaCUe9-xV5xvNw/viewform?usp=dialog", "_blank");
    }
    const closeWithConfirmation = () => {
        if (!clickedRegistrationForm) {
            const confirmed = confirm("You have not clicked on the registration form yet. Are you sure you want to close the window?");
            if (!confirmed) {
                return;
            }
        }
        props.onClose();
    }
    const handleConfirmInput = () => {
        const personalInformation: PersonalInformation = {
            userName: username,
            educationalBackground: educationalBackground,
            occupation: occupation,
            researchField: researchField
        }
        props.handleInputConfirmation(personalInformation);
    }
    let error_msg = "";
    let error_colour = "";
    if (props.personalInformationResponse != undefined) {
        if (props.personalInformationResponse.userAlreadyRegistered) {
            error_msg = "It seems that you have already registered, but originally registered with different information. If you are trying to change your personal information, just click 'Confirm' to update your information and continue. Note however, that you cannot change your username.";
            error_colour = "text-violet-600";
        }
        if (props.personalInformationResponse.nameExists) {
            error_msg = "It seems that another user has already registered with this username. If you previously used this username, but changed your browser or device in the meantime, you can click 'Confirm' again to continue under this name.";
            error_colour = "text-red-500";
        }
        if (props.personalInformationResponse.nameChange) {
            error_msg = "It seems that you have already registered, but originally used a different username. You cannot change your username.";
            error_colour = "text-red-500";
        }
    }
    return (
        <div className={`${props.isOpen ? 'block' : 'hidden'} w-full items-center justify-center flex`}>
            <BlurCover onClick={props.registrationSuccess ? props.onClose : () => {}}/>
            {!props.registrationSuccess && <div className="absolute flex flex-col top-10 bottom-10 z-20 max-w-settings w-1/2 max-h-5/6 flex-col rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                    <p className="MediumBanner">Personal Information</p>
                    {error_msg.length == 0  && <p className="text-sm text-slate-500 text-justify">Once you hit confirm you may still edit the optional fields by returning to this window from the menu. However, your username <b>cannot</b> be changed once confirmed.</p>}
                    {error_msg.length > 0 && <p className={`${error_colour} text-justify`}>{error_msg}</p>}
                </div>
                <div className="flex flex-col w-full h-2/3 ">
                    <div className="flex flex-col overflow-y-scroll h-full w-full gap-2">
                        <WithLabel label="Username" isBig={false} fillHeight={false}>
                            <input type="text" className="border-2 border-gray-300 rounded-lg p-2 mx-1" value={username} onChange={(event) => handleChangeUsername(event.target.value)} placeholder="Enter any name you like..." />
                        </WithLabel>
                        <WithLabel label="Educational Background (Optional)" isBig={false} fillHeight={false}>
                            <textarea className="border-2 border-gray-300 rounded-lg p-2 mx-1" value={educationalBackground} onChange={(event) => handleChangeEducationalBackground(event.target.value)} placeholder="E.g. Computer Science"/>
                        </WithLabel>
                        <WithLabel label="Occupation (Optional)" isBig={false} fillHeight={false}>
                            <textarea className="border-2 border-gray-300 rounded-lg p-2 mx-1" value={occupation} onChange={(event) => handleChangeOccupation(event.target.value)} placeholder="E.g. Researcher, Student" />
                        </WithLabel>
                        <WithLabel label="Research Field (Optional)" isBig={false} fillHeight={false}>
                            <textarea className="border-2 border-gray-300 rounded-lg p-2 mx-1 mb-1" value={researchField} onChange={(event) => handleChangeResearchField(event.target.value)} placeholder="E.g. XAI for LLMs" />
                        </WithLabel>
                    </div>
                </div>
                <div className="absolute bottom-4 w-full px-5 justify-between flex flex-row items-center">
                    
                    <div className={`${props.existingPersonalInformation && error_msg.length == 0 ? 'block' : 'invisible'}`}>
                        <Button onClick={props.onClose} order={3}>
                            Cancel
                        </Button>
                    </div>
                    <Button onClick={handleConfirmInput} order={1} disabled={username === ""}>
                        Confirm
                    </Button>
                </div>
            </div>}
            {props.registrationSuccess &&
                <div className="absolute flex flex-col top-10 bottom-10 z-20 max-w-settings w-1/2 h-fit flex-col rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg items-center gap-2">
                    <p className="MediumBanner">Personal Information</p>
                    <div className="px-4">
                        <p className="text-center text-lg font-bold">Site Registration successfull!</p>
                        <p className="text-justify">Thank you for participating in the study. Now that you've registered on the site, follow this link to fill in your information in a google form:</p>
                        <button className="underline text-blue-600" onClick={goToRegistrationForm}>Registration Form</button>
                    </div>
                    <div className="px-6">
                        <p className="text-justify"><b>Next Steps:</b> For the first part of the study go to "Study Tasks". For the second part of the study go to "Begin Explanation Comparison". <br/>If you feel lost check the introduction page.</p>
                    </div>
                    <div className="flex w-full px-5 items-center justify-center ">
                        <Button onClick={closeWithConfirmation} order={1} >
                            Continue
                        </Button>
                    </div>
                </div>

            }
        </div>


    )
}

export default IdentificationPopup;