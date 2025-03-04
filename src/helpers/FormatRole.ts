import { RoleEnum, LevelEnum, CentreEnum } from '../db/types';

export const formatRole = (role: RoleEnum): string => {
  switch (role) {
    case RoleEnum.Office:
      return 'Office';
    case RoleEnum.Supervisor:
      return 'Supervisor';
    case RoleEnum.Invigilator:
      return 'Invigilator';
    case RoleEnum.Developer:
      return 'Developer';
    case RoleEnum.Examiner:
      return 'Examiner';
    default:
      return role;
  }
};

export function sortLevels(levels: LevelEnum[]): LevelEnum[] {
  return levels.sort();
}

const roleOrder: { [key in RoleEnum]: number } = {
  [RoleEnum.Office]: 1,
  [RoleEnum.Supervisor]: 2,
  [RoleEnum.Examiner]: 3,
  [RoleEnum.Invigilator]: 4,
  [RoleEnum.Developer]: 5,
};

export const sortRoles = (roles: RoleEnum[]): RoleEnum[] => {
  return roles.sort((a, b) => roleOrder[a] - roleOrder[b]);
};

const centreOrder: { [key in string]: number } = {
  [CentreEnum.Brno]: 1,
  [CentreEnum.Praha]: 2,
};

export const sortCentres = (centres: CentreEnum[]): CentreEnum[] => {
  return centres.sort((a, b) => centreOrder[a] - centreOrder[b]);
};
