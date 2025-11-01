import '../../src/styles/selectionCard.css';
import React from 'react';
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { useState,useEffect } from 'react';


import { MdVisibility, MdVisibilityOff, MdCameraAlt } from 'react-icons/md';

export function SelectionCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: userImg,
    name: '',
    email: '',
    password: '',
    navColor: '#1B3A5C'
  });

  // Mostrar/Ocultar password
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Manejar cambios de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: URL.createObjectURL(file)
      }));
    }
  };


  const [sidebarColor, setSidebarColor] = useState(localStorage.getItem('sidebarColor') || '#2C2F36');

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSidebarColor(newColor);
    localStorage.setItem('sidebarColor', newColor);
    document.documentElement.style.setProperty('--sidebar-bg', newColor);
  };

  return (
    <div className="selection-card">
      <h2 className="title-settings-name">Ajustes de Perfil</h2>

      {/* Contenedor de Imagen */}
      <div className="profile-img-container">
        <label htmlFor="profile-upload" className="user-img-label">
          <img
            src={formData.profileImage}
            alt="User"
            className="user-img"
          />
          <div className="overlay-camera">
            <MdCameraAlt size={22} color="#fff" />
          </div>
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Inputs */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 3 }}>
        <FormControl sx={{ m: 1, width: '30ch' }} variant="filled">
          <InputLabel htmlFor="name-input">Nombre</InputLabel>
          <FilledInput
            id="name-input"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '30ch' }} variant="filled">
          <InputLabel htmlFor="email-input">Email</InputLabel>
          <FilledInput
            id="email-input"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '30ch' }} variant="filled">
          <InputLabel htmlFor="password-input">Contraseña</InputLabel>
          <FilledInput
            id="password-input"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Box>

      {/* Selector de color */}
      <button className="save-button" id='' >Guardar Cambios</button>
    </div>
  );
}

export default SelectionCard;
