import bcrypt from 'bcrypt';

export const isPasswordMatched = async (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(givenPassword, savedPassword);
};
