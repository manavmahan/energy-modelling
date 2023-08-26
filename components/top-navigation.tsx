'use client';

import React from "react";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react'
import Link from 'next/link'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faM } from "@fortawesome/free-solid-svg-icons";
import { URLS } from "../functions/constants";

export function TopNavigation(){
    return (
      <Navbar>
        <NavbarBrand>
          {/* <AcmeLogo /> */}
      
          <Link href={URLS.HOME} target="_blank" className="flex items-center font-display text-2xl">
            <FontAwesomeIcon icon={faM} />
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <p aria-current="page" color="foreground">
              Energy Modelling
            </p>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {/* <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
              Sign Up
            </Button>
          </NavbarItem> */}
        </NavbarContent>
      </Navbar>
    );
  }