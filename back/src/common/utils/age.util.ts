export const ageOn = (birth: Date, today: Date = new Date()): number => {
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

export const isValidBirthDate = (birth: Date): boolean =>
  !Number.isNaN(birth.getTime()) && birth.getTime() <= Date.now() && ageOn(birth) <= 120;