"use client";

import React, { useEffect, useState } from "react";
import { Input, Textarea, useInput } from "@nextui-org/react";

const validateQuery = (query) => {
    return true;
};

export const QueryArea = () =>{
    const{value, setValue, reset, bindings} = useInput("")
    const helper = React.useMemo(() => {
        if (!value)
        return {
            text: "",
            color: "",
        };
        const isValid = validateQuery(value);
        return {
        text: isValid ? "" : "Enter a valid query!",
        color: isValid ? "success" : "error",
        };
    }, [value]);
    return [value, setValue, <Textarea
        key="query"
        {...bindings}
        rows={5}
        width="90%"
        shadow={false}
        onClearClick={reset}
        status={helper.color}
        color={helper.color}
        helperColor={helper.color}
        helperText={helper.text}
        type="query"
        aria-label="Query"
        placeholder="type your query..."
    />]
}

export const ValueArea = () =>{
    const{value, setValue, reset, bindings} = useInput("value")
    const [valid, setValid] = useState(true);
    const helper = React.useMemo(() => {
        if (!value)
        return {
            color: "",
        };
        return {
            color: valid ? "success" : "error",
        };
    }, [value, valid]);
    return [value, setValue, setValid, <Textarea
        key="projectName"
        {...bindings}
        readOnly
        rows={20}
        width="90%"
        shadow={false}
        status={helper.color}
        color={helper.color}
        helperColor={helper.color}
        type="value"
        aria-label="Value"
        placeholder="value"
    />]
}

export const EditableValueArea = (label) =>{
    const [value, setValue] = useState("loading...");
    const [state, setState] = useState(false);

    useEffect(()=>{
        try{
            JSON.parse(value);
            setState(true);
        }catch(e){
            setState(false);
        }
    },[value])

    const color = React.useMemo(() => {
        return state ? "success" : "danger"
    }, [state]);

    return {
        value: value,
        setValue: setValue,
        setState: setState,
        prop: ( <Textarea
            key={label.toLowerCase().replace(" ", "-")}
            type={label.toLowerCase().replace(" ", "-")}
            aria-label={label.toLowerCase().replace(" ", "-")}
            placeholder={label}
            value={value}
            onValueChange={setValue}
            minRows={25}
            maxRows={25}
            shadow={false}
            status={color}
            color={color}
            helperColor={color}
            
        />)
    }
}