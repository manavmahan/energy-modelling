"use client";

import React, { useEffect } from "react";
import { Input } from "@nextui-org/react";

export function TextInput(label, initialValue, isValid, errorMessage, ...args) {
    const [value, setValue] = React.useState(initialValue);
    const [state, setState] = React.useState("invalid");
    useEffect(() => {
        if (value === "") {
            setState("invalid");
            return;
        }
        isValid(...args, value).then((res) => {
            setState(res ? "valid" : "invalid");
        });
    }, [args, value, isValid])

    return {
        value: value,
        setValue: setValue,
        valid: state === "valid",
        prop: (
            <div>
                <Input
                isClearable
                value={value}
                type={label.toLowerCase().replace(" ", "-")}
                label={label}
                variant="bordered"
                color={state === "invalid" ? "danger" : "success"}
                errorMessage={state === "invalid" && errorMessage}
                validationState={state}
                onValueChange={setValue}
                className="max-w-xs"
                />
            </div>
        )
    }
}

// export const ProjectName = (userName, isValidUser) =>{
//     const{value, setValue, reset, bindings} = useInput(["tausendpfund-gn"]);
//     const [valid, setValid] = useState(false);

//     React.useMemo(() => {
//         if (isValidUser){
//             setValid(false); 
//             isValidUserProject(userName, value, setValid);
//         }else{
//             setValid(true);
//         }
//     }, [userName, isValidUser, value])

//     const helper = React.useMemo(() => {
//         if (!value)
//         return {
//             text: "",
//             color: "",
//         };
//         return {
//             text: valid ? "" : "Enter a valid project name",
//             color: valid ? "success" : "error",
//         };
//     }, [valid, value]);
//     return [value, setValue, valid, <Input
//         key="projectName"
//         {...bindings}
//         clearable
//         shadow={false}
//         onClearClick={reset}
//         status={helper.color}
//         color={helper.color}
//         helperColor={helper.color}
//         helperText={helper.text}
//         type="projectName"
//         aria-label="Project Name"
//         placeholder="Project Name"
//     />]
// }