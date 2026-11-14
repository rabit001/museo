import { CharacterId } from '../types/museum';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  tagline: string;
  tunicColor: string;
  trimColor: string;
  scarfColor: string;
  trousersColor: string;
  bootColor: string;
  skinColor: string;
  hatStyle: 'cap' | 'headphones' | 'chef' | 'wizard' | 'robot';
}

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 'explorador',
    name: 'Explorador 404',
    tagline: 'Túnica verde esmeralda, mochila de campo y gorro clásico.',
    tunicColor: '#3b8c58',
    trimColor: '#e6c15a',
    scarfColor: '#d96b43',
    trousersColor: '#26444e',
    bootColor: '#4c2b17',
    skinColor: '#f4c89e',
    hatStyle: 'cap',
  },
  {
    id: 'melomano',
    name: 'Melómano del Vinilo',
    tagline: 'Chaqueta índigo, audífonos dorados y vibra de estudio nocturno.',
    tunicColor: '#35488c',
    trimColor: '#ff9f5a',
    scarfColor: '#6adcf0',
    trousersColor: '#1f2338',
    bootColor: '#292730',
    skinColor: '#efc094',
    hatStyle: 'headphones',
  },
  {
    id: 'chef',
    name: 'Chef Anfitrión',
    tagline: 'Filipina blanca, pañuelo burdeos y gorro alto de cocina.',
    tunicColor: '#f2efe4',
    trimColor: '#d8a648',
    scarfColor: '#9e3232',
    trousersColor: '#2c3540',
    bootColor: '#3d281f',
    skinColor: '#f2c197',
    hatStyle: 'chef',
  },
  {
    id: 'astronomo',
    name: 'Astrónomo Estelar',
    tagline: 'Capa violeta de observatorio y sombrero de ala estelar.',
    tunicColor: '#5c3c8a',
    trimColor: '#f4d47d',
    scarfColor: '#7be4ec',
    trousersColor: '#281e3d',
    bootColor: '#3d2638',
    skinColor: '#f4ccb0',
    hatStyle: 'wizard',
  },
  {
    id: 'robot404',
    name: 'Autómata 404',
    tagline: 'Chasis turquesa metálico con visor luminoso y antena.',
    tunicColor: '#2e93a3',
    trimColor: '#ffe073',
    scarfColor: '#e3644b',
    trousersColor: '#3a515c',
    bootColor: '#24323b',
    skinColor: '#b7dce3',
    hatStyle: 'robot',
  },
];

export function getCharacterProfile(id?: CharacterId | string | null): CharacterProfile {
  return CHARACTER_PROFILES.find((c) => c.id === id) || CHARACTER_PROFILES[0];
}
