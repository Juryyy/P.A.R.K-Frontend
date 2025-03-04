import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function setLevel(cell: string) {
  const match = cell.match(/([A-Z]\d) (\w+)/);
  if (match) {
    cell = match[1] + ' ' + match[2];
  }
  if (cell.includes('School')) {
    cell = cell + ' For Schools';
  }
  return cell;
}

export function setDateOfExam(cell: string) {
  const dateParts = cell.split('.');
  const dateObject = new Date(
    +dateParts[2],
    parseInt(dateParts[1]) - 1,
    +dateParts[0]
  );
  return dateObject;
}

export function setTypeOfExam(cell: string) {
  return cell.trim();
}

export function setBirthDate(cell: string) {
  const dateParts = cell.split('.');
  const dateObject = new Date(
    +dateParts[2],
    parseInt(dateParts[1]) - 1,
    +dateParts[0]
  );
  return dateObject;
}

export function setFirstName(cell: string) {
  const names = cell.split(' ');
  return names.slice(0, -1).join(' ');
}

export function setLastName(cell: string) {
  const names = cell.split(' ');
  return names[names.length - 1];
}

export function setEmail(cell: string) {
  const trimmedCell = cell.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const test = regex.test(trimmedCell);
  return test
    ? trimmedCell.toLowerCase()
    : '!Error email format!: ' + trimmedCell;
}

export function setPhone(cell: string) {
  const phoneNumber = parsePhoneNumberFromString(cell, 'CZ');

  if (phoneNumber) {
    if (phoneNumber.country === 'CZ') {
      return phoneNumber.formatNational();
    } else {
      return (
        '(' + phoneNumber.country + ') ' + phoneNumber.formatInternational()
      );
    }
  } else {
    return '!Error phone format!: ' + cell;
  }
}

export function setCode(cell: string) {
  const trimmedCell = cell.trim();
  const regex = /^["]*$/;
  return regex.test(trimmedCell) ? '' : trimmedCell.split(' ')[0];
}

export function setPartner(cell: string) {
  return clearEmptyStrings(cell);
}

export function setMock(cell: string) {
  if (cell === 'Ano') {
    return true;
  } else {
    return false;
  }
}

export function setPaid(cell: string) {
  if (cell.includes('UnPaid')) {
    return false;
  } else if (cell.includes('Paid')) {
    return true;
  } else {
    return false;
  }
}

export function setOrderId(cell: string) {
  return Number(cell.split(' ')[1]);
}

export function setRequirements(cell: string) {
  return clearEmptyStrings(cell);
}

export function setCrfToSchool(cell: string) {
  if (cell === 'Ano') {
    return true;
  } else {
    return false;
  }
}

export function setNote(cell: string) {
  return clearEmptyStrings(cell);
}

function clearEmptyStrings(cell: string) {
  const trimmedCell = cell.trim();
  const regex = /^["]*$/;
  return regex.test(trimmedCell) ? '' : trimmedCell;
}
