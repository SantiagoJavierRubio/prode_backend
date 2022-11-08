import fs from "fs";
import path from "path";

const stringFromHtml = (name: string, language: string): string => {
  const filePath = path.join(
    process.cwd(),
    "Middleware/Nodemailer/templates/",
    `${name}_${language}`
  );
  return fs.readFileSync(`${filePath}.html`, "utf8").toString();
};

export const verificationEmailTemplate = (
  link: string,
  language: string
): string => {
  return stringFromHtml("verificationEmail", language).replace(
    "{{link}}",
    link
  );
};

export const changePasswordEmailTemplate = (
  link: string,
  language: string
): string => {
  return stringFromHtml("changePasswordEmail", language).replace(
    "{{link}}",
    link
  );
};
