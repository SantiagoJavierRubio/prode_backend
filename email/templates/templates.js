import fs from "fs";
import path from "path";

const stringFromHtml = (name, lang) => {
  const filePath = path.join(
    process.cwd(),
    "/email/templates/",
    `${name}_${lang}`
  );
  return fs.readFileSync(`${filePath}.html`, "utf8").toString();
};

export const verificationEmailTemplate = (link, lang) => {
  return stringFromHtml("verificationEmail", lang).replace("{{link}}", link);
};

export const changePasswordEmailTemplate = (link, lang) => {
  return stringFromHtml("changePasswordEmail", lang).replace("{{link}}", link);
};
