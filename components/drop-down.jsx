'use client';

import React from "react"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, select } from '@nextui-org/react';

export default function DropDownProp(label, itemDict){
  let items = Object.entries(itemDict).map(([k, v]) => { return {key: k, label: v} })
  
  const [selected, setSelectedKeys] = React.useState(items[0].key);
  const selectedValue = React.useMemo(
    () => {
      let key = selected['anchorKey'] ? selected['anchorKey'] : selected;
      return itemDict[key];
    },
    [selected, itemDict]
  );

  return {
    value: selected['anchorKey'] ? selected['anchorKey'] : selected,
    prop: (
      <Dropdown label={label}>
        <DropdownTrigger>
          <Button variant="light" label={label}> 
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label={label.toLowerCase().replace(" ", "-")}
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selected}
          onSelectionChange={setSelectedKeys}
          items={items}
        >
          {(items) => (
            <DropdownItem key={items.key}>
              {items.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }
}