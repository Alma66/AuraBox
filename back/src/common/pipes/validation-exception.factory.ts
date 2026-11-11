import { BadRequestException, ValidationError } from '@nestjs/common';

const LABELS: Record<string, string> = {
  email: 'El email',
  password: 'La contraseña',
  newPassword: 'La nueva contraseña',
  currentPassword: 'La contraseña actual',
  firstName: 'El nombre',
  lastName: 'El apellido',
  name: 'El nombre',
  phone: 'El teléfono',
  phoneNumber: 'El teléfono',
  documentNumber: 'El número de documento',
  documentType: 'El tipo de documento',
  birthDate: 'La fecha de nacimiento',
  streetAddress: 'La calle',
  addressNumber: 'El número de la dirección',
  floorNumber: 'El piso',
  addressDetails: 'Las referencias adicionales',
  city: 'La ciudad',
  province: 'La provincia',
  postalCode: 'El código postal',
  title: 'El título',
  comment: 'El comentario',
  description: 'La descripción',
  message: 'El mensaje',
  subject: 'El asunto',
  rating: 'La calificación',
  price: 'El precio',
  quantity: 'La cantidad',
  slogan: 'El eslogan',
  address: 'La dirección',
};

const labelFor = (property: string): string => LABELS[property] ?? `El campo "${property}"`;

const agree = (label: string, word: string): string => {
  if (label.startsWith('Las ')) return `${word.slice(0, -1)}as`;
  if (label.startsWith('La ')) return `${word.slice(0, -1)}a`;
  if (label.startsWith('Los ')) return `${word}s`;
  return word;
};

const firstNumber = (message: string): string => message.match(/-?\d+(\.\d+)?/)?.[0] ?? '';

const isDefaultMessage = (property: string, message: string): boolean =>
  message.startsWith(property) || message.startsWith('each value in') || message.startsWith('property ');

const translate = (key: string, property: string, message: string): string => {
  const label = labelFor(property);
  const amount = firstNumber(message);

  switch (key) {
    case 'isNotEmpty':
    case 'isDefined':
      return `${label} es ${agree(label, 'obligatorio')}`;
    case 'isEmail':
      return `${label} no es ${agree(label, 'válido')}`;
    case 'minLength':
      return `${label} debe tener al menos ${amount} caracteres`;
    case 'maxLength':
      return `${label} no puede superar los ${amount} caracteres`;
    case 'length':
      return `${label} no tiene una longitud válida`;
    case 'isInt':
    case 'isNumber':
    case 'isNumberString':
    case 'isDecimal':
      return `${label} debe ser un número`;
    case 'isPositive':
      return `${label} debe ser mayor a 0`;
    case 'min':
      return `${label} debe ser como mínimo ${amount}`;
    case 'max':
      return `${label} debe ser como máximo ${amount}`;
    case 'isDateString':
    case 'isDate':
    case 'isISO8601':
      return `${label} debe ser una fecha válida`;
    case 'isUrl':
      return `${label} debe ser un enlace válido`;
    case 'isEnum':
    case 'isIn':
      return `${label} tiene un valor no permitido`;
    case 'arrayMinSize':
      return `${label} debe tener al menos ${amount} elementos`;
    case 'arrayMaxSize':
      return `${label} no puede tener más de ${amount} elementos`;
    case 'whitelistValidation':
      return 'Se enviaron datos que no corresponden a este formulario';
    default:
      return `${label} no es ${agree(label, 'válido')}`;
  }
};

const PRIORITY = [
  'isNotEmpty',
  'isDefined',
  'isString',
  'isEmail',
  'isInt',
  'isNumber',
  'isNumberString',
  'isDateString',
  'isUrl',
  'isEnum',
  'isIn',
  'minLength',
  'min',
  'maxLength',
  'max',
];

const rank = (key: string): number => {
  const index = PRIORITY.indexOf(key);
  return index === -1 ? PRIORITY.length : index;
};

const collect = (errors: ValidationError[]): string[] =>
  errors.flatMap((error) => {
    const entries = Object.entries(error.constraints ?? {});
    const custom = entries
      .filter(([, message]) => !isDefaultMessage(error.property, message))
      .map(([, message]) => message);
    const defaults = entries
      .filter(([, message]) => isDefaultMessage(error.property, message))
      .sort(([a], [b]) => rank(a) - rank(b));
    const missing = error.value === undefined || error.value === null || error.value === '';
    let own: string[] = [];
    if (custom.length > 0) {
      own = custom;
    } else if (defaults.length > 0) {
      own = missing && defaults.every(([key]) => key !== 'whitelistValidation')
        ? [translate('isNotEmpty', error.property, '')]
        : [translate(defaults[0][0], error.property, defaults[0][1])];
    }
    const children = error.children && error.children.length > 0 ? collect(error.children) : [];
    return [...own, ...children];
  });

export const validationExceptionFactory = (errors: ValidationError[]) =>
  new BadRequestException(Array.from(new Set(collect(errors))));