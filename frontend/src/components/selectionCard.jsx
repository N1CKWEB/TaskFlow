// src/components/SelectionCard.jsx
import '../../src/styles/selectionCard.css';
import React from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';

export function SelectionCard() {
  return (
    <div className="selection-card">
      <h2>Selection Card</h2>
      <img src={userImg} alt="User" className="user-img" />
      <div className="menu">
      </div>
    </div>
  );
}

export default SelectionCard;
