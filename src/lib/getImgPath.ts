import { env } from "./env";

export const getImgUrl = (imgPath: string) => {
  return `${env.NEXT_PUBLIC_SERVER_URL}/${imgPath}`;
};
