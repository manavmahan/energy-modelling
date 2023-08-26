import { Button, ButtonGroup, } from "@nextui-org/react"
import { TextInput } from "@/components/text-input"
import { INITIAL_VALUES, ERROR_MESSAGES } from "@/functions/constants";
import { isValidUser, isValidUserProject } from "@/functions/database";

export function UserProjectInput(){
    const userName = TextInput("User Name", INITIAL_VALUES.USER_NAME, isValidUser, ERROR_MESSAGES.USER_NAME);
    const projectName = TextInput("Project Name", INITIAL_VALUES.PROJECT_NAME, isValidUserProject, ERROR_MESSAGES.PROJECT_NAME, userName.value);
    
    return {
        userProjectName: {userName: userName.value, projectName: projectName.value, valid: true},
        props: (<div>
            <div className="flex gap-1">
                <ProjectButtons setUserName={userName.setValue} setProjName={projectName.setValue}/>
            </div>
            <div className="flex gap-10">
                {userName.prop}
                {projectName.prop}
            </div>
        </div>)
    }
}

export default function ProjectButtons(setFunc, ){
    const setUserName = setFunc.setUserName;
    const setProjectName = setFunc.setProjName;
    const combs = {
        firstProject: [
            {userName: 'tum-gni', projectName: 'tausendpfund-gn'},
            {userName: 'tum-gni', projectName: 'tausendpfund-in'},
            {userName: 'tum-gni', projectName: 'tausendpfund-ed'},
        ],
        secondProject: [
            {userName: 'tum-gni', projectName: 'house-gn'},
//            {userName: 'tum-gni', projectName: 'house-in'},
            {userName: 'tum-gni', projectName: 'house-ed'},
        ],
    }
    const props = []
    Object.entries(combs).forEach(([k, u], i)  => {
        let currentProps = []
        u.forEach((e, i) => {
            currentProps.push(
                <Button size="sm" variant="light" color="primary"
                    key={e.projectName}
                    onPress = {(event) => {setProjectName(e.projectName); setUserName(e.userName)}}>
                    {e.userName} - {e.projectName} 
                </Button>
            )
        });
        props.push (
            <div className='inline-block' key={k} color="danger">
                {currentProps}
            </div>
        )
    })
    return props
}
