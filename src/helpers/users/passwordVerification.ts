import bcrypt from 'bcrypt';

export const correctPassword = async function (candidatePassword: string, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const changedPasswordAfter = function (JWTTimestamp: number, passChangedAt: Date | undefined): boolean {
  const passwordChangedAt: Date = new Date(passChangedAt ? passChangedAt : '');
  const changedTimeStamp: number = Math.floor(passwordChangedAt.getTime() / 1000);
  return changedTimeStamp > JWTTimestamp;
};
