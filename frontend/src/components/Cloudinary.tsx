const cloudName = "dmqnbz3tg";

export function getCldImageUrl(publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}