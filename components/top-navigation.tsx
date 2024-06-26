'use client';

import React from "react";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react'
import Link from 'next/link'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faM } from "@fortawesome/free-solid-svg-icons";
import { URLS } from "@/functions/constants";

import LoginButton from "@/components/login-button.jsx";
import { SessionProvider } from "next-auth/react";

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
          <SessionProvider>
            <LoginButton />
          </SessionProvider>
        </NavbarContent>
      </Navbar>
    );
  }