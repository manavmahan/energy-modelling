"use client";

import React, { Key } from "react";
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import PlotGeometry from "@/features/geometry-tab/geometry";
import PlotProperties from "@/features/properties-tab/properties";
import Project from "@/features/project-tab/project";
import { UserProjectInput } from "@/components/project-button";

export default function TabsNavigation() {
  // let userProjectName = {"userName": "", "projectName": "", "valid": false};
  const {
    userProjectName: userProjectName, 
    props: props
  } = UserProjectInput();

  let tabs = [
    {
      id: "building",
      label: "Building",
      content: <div>
          {props}
          <PlotGeometry userProjectName={userProjectName}/>
        </div>
    },
    {
      id: "properties",
      label: "Properties",
      content: <div>
        {props}
        <PlotProperties userProjectName={userProjectName}/>
      </div>
    },
    {
      id: "project",
      label: "Project",
      content: <div>
        {props}
        <Project userProjectName={userProjectName}/>
      </div>
    }
  ];

  // userProjectName = {"userName": "tum-gni", "projectName": "tausendpfund-gn", "valid": true};

  const [selected, setSelected] = React.useState(tabs[0].id);
  function switchTabs(key: Key) {
    setSelected(key as string);
  }

  return (
    <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between w-full">
        <Card className="w-screen h-screen rounded-none bg-white">
            <CardBody className="overflow-hidden">
                <Tabs 
                    aria-label="Options" color="primary" variant="underlined"
                    selectedKey={selected}
                    onSelectionChange={switchTabs}
                    items={tabs}>
                        {(item) => (
                        <Tab key={item.id} title={item.label}>
                            <Card>
                            <CardBody>
                                {item.content}
                            </CardBody>
                            </Card>  
                        </Tab>
                        )}
                </Tabs>
            </CardBody>
        </Card>
    </div>  
  );
}
