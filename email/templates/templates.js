import fs from 'fs';
import path from 'path';

const stringFromHtml = (name) => {
  const filePath = path.join(process.cwd(), '/email/templates/', name);
  return fs.readFileSync(`${filePath}.html`, 'utf8').toString();
};

export const verificationEmailTemplate = (link) => {
  return stringFromHtml('verificationEmail').replace('{{link}}', link);
};

export const changePasswordEmailTemplate = (link) => {
  return stringFromHtml('changePasswordEmail').replace('{{link}}', link);
};
