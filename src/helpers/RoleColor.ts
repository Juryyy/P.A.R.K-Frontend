import { RoleEnum } from '../stores/db/types';

export const getRoleColor = (role: RoleEnum): string => {
  switch (role) {
    case RoleEnum.Office:
      return 'purple';
    case RoleEnum.Supervisor:
      return 'green';
    case RoleEnum.Invigilator:
      return 'orange';
    case RoleEnum.Technician:
      return 'info';
    case RoleEnum.Examiner:
      return 'blue';
    default:
      return 'grey';
  }
};
