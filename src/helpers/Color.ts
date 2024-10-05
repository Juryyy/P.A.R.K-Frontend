import { L } from 'app/dist/pwa/assets/index.543cd0d7';
import { LevelEnum, RoleEnum } from '../db/types';

export const getRoleColor = (role: RoleEnum): string => {
  switch (role) {
    case RoleEnum.Office:
      return 'purple';
    case RoleEnum.Supervisor:
      return 'green';
    case RoleEnum.Invigilator:
      return 'orange';
    case RoleEnum.Developer:
      return 'info';
    case RoleEnum.Examiner:
      return 'blue';
    default:
      return 'grey';
  }
};

export const getLevelColor = (level: LevelEnum): string => {
  switch (level) {
    case LevelEnum.A1:
      return 'yellow';
    case LevelEnum.A2:
      return 'orange';
    case LevelEnum.B1:
      return 'light-green';
    case LevelEnum.B2:
      return 'green';
    case LevelEnum.C1:
      return 'light-blue';
    case LevelEnum.C2:
      return 'blue';
    default:
      return 'grey'
  }
};
