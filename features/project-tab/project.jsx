"use client";

import React, { useEffect } from "react";
import { Button, ButtonGroup, Input, useInput, user } from "@nextui-org/react";

import {TextInput} from "@/components/text-input";
import { ERROR_MESSAGES, INITIAL_VALUES } from "@/functions/constants";
import DropDownProp from "@/components/drop-down";
import { EditableValueArea } from "@/components/textarea-props";
// import { ProjectColumnProp } from "@/components/drop-down";
import ProjectButtons from "@/components/project-button";
import { getColumn, updateColumn, isValidUser, isValidUserProject } from "@/functions/database";

const dropdownMenuItems = {
  PROJECT_SETTINGS: "Settings",
  GEOMETRY: "Geometry",
  CONSUMPTION: "Consumption",
  PARAMETERS: "Parameters",
  dummyObjects: "Dummy Objects",
  constructions: "Constructions",
  regressorHyperparameters: "Regressor",
  generatorHyperparameters: "Generator",
}

export default function Project({userProjectName}) {
  const userName = userProjectName.userName;
  const projectName = userProjectName.projectName; 

  const {
    value: columnName, 
    prop: columnProp,
  } = DropDownProp("Column Name", dropdownMenuItems);

  const {
    value: columnValue, 
    setValue: setColumnValue, 
    setState: setColumnState,
    prop: valueProp
  } = EditableValueArea("Value");

  function settingColumnValue(){
    if (userProjectName.valid)
    { 
      getColumn({userName: userName, projectName: projectName}, columnName).then((value)=>{
        setColumnValue(value.value);
        setColumnState(value.state);
      }).catch((error)=>{
        setColumnValue(error.message);
        setColumnState("error");
      });
    }
  }
  
  React.useEffect(()=>{
    settingColumnValue();
  },[userName, projectName, columnName, ])

  const update = () => {
    updateColumn({userName: userName, projectName: projectName}, columnName, columnValue, alert);
  }

  const reset = () => {
    settingColumnValue();
  }

  return (<div>
    <div className="flex gap-10">
      {columnProp}
    </div>
    
    <div className="flex font-mono">
      {valueProp}
    </div>

    <div className="flex gap-1">
      <ButtonGroup>
        <Button onPress={reset}>Reset</Button>
        <Button onPress={update}>Update</Button>
      </ButtonGroup>
    </div>
  </div>)
}
