import { RoleEnum } from '../stores/db/types';

export const formatRole = (role: RoleEnum): string => {
  switch (role) {
    case RoleEnum.Office:
      return 'Office';
    case RoleEnum.Supervisor:
      return 'Supervisor';
    case RoleEnum.Invigilator:
      return 'Invigilator';
    case RoleEnum.Technician:
      return 'Tech';
    case RoleEnum.Examiner:
      return 'Examiner';
    default:
      return role;
  }
};


const roleOrder: { [key in RoleEnum]: number } = {
  [RoleEnum.Office]: 1,
  [RoleEnum.Supervisor]: 2,
  [RoleEnum.Examiner]: 3,
  [RoleEnum.Invigilator]: 4,
  [RoleEnum.Technician]: 5
};

export const sortRoles = (roles: RoleEnum[]): RoleEnum[] => {
  return roles.sort((a, b) => roleOrder[a] - roleOrder[b]);
};
